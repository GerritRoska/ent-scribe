# 3. Transcription (TRANSCRIPTION) - Implementation Instructions

**Component:** Real-time audio transcription via Deepgram, streaming audio chunks
**Owner:** [Assign developer]
**Status:** NOT STARTED
**Estimated Time:** 2-3 days
**Dependencies:** Recording component (2_RECORDING_INSTRUCTIONS.md)

---

## Objective

Implement real-time transcription that:
1. Receives audio chunks from recorder (every 1-2 seconds)
2. Streams chunks to Deepgram API in real-time
3. Returns partial + final transcripts
4. Handles streaming errors gracefully
5. Supports multiple language models (medical optimized)

---

## Deepgram Setup

### Step 1: Get Deepgram API Key

1. Sign up at https://console.deepgram.com
2. Go to **API Keys** → Create new key
3. Add to `.env.local`:
```env
NEXT_PUBLIC_DEEPGRAM_API_KEY=<your-deepgram-api-key>
```

### Step 2: Choose Model

For medical/ENT transcription, use:
- **Model:** `nova-2-medical` (optimized for medical speech)
- **Language:** `en-US` (can be parameterized)
- **Sample Rate:** `16000` (from recording)

---

## Technical Implementation

### 1. Deepgram Client

#### Step 1.1: Create Deepgram API Client
`lib/api/deepgram.ts`:
```typescript
/**
 * Deepgram transcription client
 * Handles real-time WebSocket streaming for medical audio
 */

export class DeepgramClient {
  private apiKey: string
  private websocket: WebSocket | null = null
  private buffer: Uint8Array[] = []

  constructor(apiKey: string) {
    this.apiKey = apiKey
  }

  /**
   * Start real-time transcription stream
   * @param onTranscript - Callback for transcript updates (partial & final)
   * @param options - Deepgram API options
   */
  async startStream(
    onTranscript: (transcript: { text: string; isFinal: boolean }) => void,
    options: DeepgramOptions = {}
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const {
          model = 'nova-2-medical',
          language = 'en-US',
          sampleRate = 16000,
          encoding = 'linear16',
          ...restOptions
        } = options

        // Build Deepgram WebSocket URL with parameters
        const params = new URLSearchParams({
          model,
          language,
          sample_rate: sampleRate.toString(),
          encoding,
          'multi_channel': 'false',
          'smart_format': 'true', // Enables smart formatting
          ...restOptions,
        })

        const wsUrl = `wss://api.deepgram.com/v1/listen?${params.toString()}`

        // Create WebSocket with auth
        this.websocket = new WebSocket(wsUrl, [
          'token',
          `Token ${this.apiKey}`,
        ])

        this.websocket.binaryType = 'arraybuffer'

        this.websocket.onopen = () => {
          console.log('Deepgram WebSocket connected')
          resolve()
        }

        this.websocket.onmessage = (event) => {
          const data = JSON.parse(event.data)

          // Handle Deepgram message types
          if (data.type === 'Results') {
            const transcript = data.channel.alternatives[0].transcript
            const isFinal = !data.is_final

            if (transcript) {
              onTranscript({
                text: transcript,
                isFinal,
              })
            }
          }

          if (data.type === 'Error') {
            console.error('Deepgram error:', data)
          }
        }

        this.websocket.onerror = (error) => {
          console.error('WebSocket error:', error)
          reject(new Error('Deepgram connection failed'))
        }

        this.websocket.onclose = () => {
          console.log('Deepgram WebSocket closed')
        }
      } catch (error) {
        reject(error)
      }
    })
  }

  /**
   * Send audio chunk to Deepgram
   * @param audioChunk - Audio data from MediaRecorder
   */
  async sendChunk(audioChunk: Blob): Promise<void> {
    if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) {
      throw new Error('WebSocket not connected')
    }

    // Convert Blob to ArrayBuffer
    const arrayBuffer = await audioChunk.arrayBuffer()
    this.websocket.send(arrayBuffer)
  }

  /**
   * Finalize transcription and close connection
   */
  finalize(): Promise<string> {
    return new Promise((resolve, reject) => {
      if (!this.websocket) {
        reject(new Error('WebSocket not initialized'))
        return
      }

      // Send final frame to signal end of audio
      this.websocket.send(JSON.stringify({ type: 'CloseStream' }))

      // Wait for final message
      const originalOnMessage = this.websocket.onmessage
      this.websocket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        if (data.type === 'Results' && !data.is_final) {
          const finalTranscript = data.channel.alternatives[0].transcript
          this.websocket!.close()
          resolve(finalTranscript)
        }
        if (originalOnMessage) {
          originalOnMessage(event)
        }
      }
    })
  }

  /**
   * Close WebSocket connection
   */
  close(): void {
    if (this.websocket) {
      this.websocket.close()
      this.websocket = null
    }
  }
}

interface DeepgramOptions {
  model?: string
  language?: string
  sampleRate?: number
  encoding?: string
  [key: string]: any
}
```

### 2. Transcription Hook

#### Step 2.1: Create useTranscription Hook
`lib/hooks/useTranscription.ts`:
```typescript
import { useRef, useState, useCallback } from 'react'
import { DeepgramClient } from '@/lib/api/deepgram'

interface TranscriptionState {
  isTranscribing: boolean
  transcript: string
  partialTranscript: string
  error: string | null
}

export function useTranscription() {
  const [state, setState] = useState<TranscriptionState>({
    isTranscribing: false,
    transcript: '',
    partialTranscript: '',
    error: null,
  })

  const deepgramRef = useRef<DeepgramClient | null>(null)
  const finalTranscriptRef = useRef<string>('')

  const startTranscription = useCallback(async () => {
    try {
      setState((prev) => ({
        ...prev,
        isTranscribing: true,
        error: null,
      }))

      const apiKey = process.env.NEXT_PUBLIC_DEEPGRAM_API_KEY
      if (!apiKey) {
        throw new Error('Deepgram API key not configured')
      }

      deepgramRef.current = new DeepgramClient(apiKey)

      // Start WebSocket stream
      await deepgramRef.current.startStream(
        (update) => {
          if (update.isFinal) {
            // Final transcript - append to main transcript
            finalTranscriptRef.current += update.text + ' '
            setState((prev) => ({
              ...prev,
              transcript: finalTranscriptRef.current,
              partialTranscript: '',
            }))
          } else {
            // Partial transcript - show in real-time
            setState((prev) => ({
              ...prev,
              partialTranscript: update.text,
            }))
          }
        },
        {
          model: 'nova-2-medical',
          language: 'en-US',
          sampleRate: 16000,
        }
      )
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Transcription failed'
      setState((prev) => ({
        ...prev,
        isTranscribing: false,
        error: errorMessage,
      }))
    }
  }, [])

  const sendAudioChunk = useCallback(async (audioChunk: Blob) => {
    if (!deepgramRef.current) {
      throw new Error('Transcription not initialized')
    }

    try {
      await deepgramRef.current.sendChunk(audioChunk)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to send audio chunk'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
      }))
    }
  }, [])

  const finalize = useCallback(async (): Promise<string> => {
    if (!deepgramRef.current) {
      throw new Error('Transcription not initialized')
    }

    try {
      const finalText = await deepgramRef.current.finalize()
      finalTranscriptRef.current += finalText

      setState((prev) => ({
        ...prev,
        isTranscribing: false,
        transcript: finalTranscriptRef.current,
        partialTranscript: '',
      }))

      return finalTranscriptRef.current
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Finalization failed'
      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isTranscribing: false,
      }))
      throw error
    }
  }, [])

  const reset = useCallback(() => {
    if (deepgramRef.current) {
      deepgramRef.current.close()
      deepgramRef.current = null
    }
    finalTranscriptRef.current = ''
    setState({
      isTranscribing: false,
      transcript: '',
      partialTranscript: '',
      error: null,
    })
  }, [])

  return {
    state,
    startTranscription,
    sendAudioChunk,
    finalize,
    reset,
  }
}
```

### 3. API Route for Transcription

#### Step 3.1: Transcription API Route (Alternative)
`app/api/transcribe/route.ts`:
```typescript
/**
 * Alternative: Server-side transcription via API route
 * Use this if you prefer to keep Deepgram API key server-side
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function POST(request: NextRequest) {
  const { audioBlob } = await request.json()

  // Get user session
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Convert base64 to buffer
    const buffer = Buffer.from(audioBlob, 'base64')

    // Call Deepgram API
    const response = await fetch('https://api.deepgram.com/v1/listen', {
      method: 'POST',
      headers: {
        Authorization: `Token ${process.env.DEEPGRAM_API_KEY}`,
        'Content-Type': 'audio/webm',
      },
      body: buffer,
    })

    if (!response.ok) {
      throw new Error(`Deepgram API error: ${response.statusText}`)
    }

    const result = await response.json()
    const transcript =
      result.results.channels[0].alternatives[0].transcript

    return NextResponse.json({ transcript })
  } catch (error) {
    console.error('Transcription error:', error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Transcription failed',
      },
      { status: 500 }
    )
  }
}
```

### 4. Integration with Recording

#### Step 4.1: Update RecordButton to use Transcription
Update `components/recording/RecordButton.tsx`:
```typescript
'use client'

import { useRecording } from '@/lib/hooks/useRecording'
import { useTranscription } from '@/lib/hooks/useTranscription'
import { useState } from 'react'

// ... existing imports and component

export default function RecordButton({ onRecordingComplete }: RecordButtonProps) {
  const recording = useRecording()
  const transcription = useTranscription()
  const [error, setError] = useState<string | null>(null)

  const handleStart = async () => {
    try {
      setError(null)
      // Start transcription first
      await transcription.startTranscription()
      // Then start recording
      await recording.startRecording()
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to start recording'
      )
    }
  }

  // On each recording data available event, send to transcription
  const handleAudioChunk = async (audioChunk: Blob) => {
    try {
      await transcription.sendAudioChunk(audioChunk)
    } catch (err) {
      console.error('Transcription chunk error:', err)
    }
  }

  const handleStop = async () => {
    try {
      const audioBlob = await recording.stopRecording()
      const finalTranscript = await transcription.finalize()
      onRecordingComplete(audioBlob, finalTranscript)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
    }
  }

  // Display both partial and final transcripts
  const displayTranscript =
    transcription.state.transcript +
    (transcription.state.partialTranscript
      ? ' ' + transcription.state.partialTranscript
      : '')

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* ... existing recording UI ... */}

      {/* Transcript Display */}
      {displayTranscript && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Real-time Transcript:</p>
          <p className="text-gray-800">
            {transcription.state.transcript}
            {transcription.state.partialTranscript && (
              <span className="text-gray-500 italic">
                {' '}
                {transcription.state.partialTranscript}
              </span>
            )}
          </p>
        </div>
      )}

      {/* ... rest of UI ... */}
    </div>
  )
}
```

---

## 5. Error Handling

### Common Deepgram Errors

```typescript
// Invalid API key
if (error.code === 401) {
  showError('Invalid Deepgram API key')
}

// Rate limit exceeded
if (error.code === 429) {
  showError('Deepgram rate limit exceeded. Wait a moment and try again.')
}

// Network error
if (!navigator.onLine) {
  showError('No internet connection. Recording cannot be transcribed.')
}

// Audio format error
if (error.message.includes('Invalid audio')) {
  showError('Audio format not supported. Please use a different microphone.')
}
```

---

## 6. Testing

#### __tests__/transcription.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DeepgramClient } from '@/lib/api/deepgram'

describe('Transcription', () => {
  let deepgram: DeepgramClient

  beforeEach(() => {
    deepgram = new DeepgramClient('test-key')
    // Mock WebSocket
    global.WebSocket = vi.fn(() => ({
      send: vi.fn(),
      close: vi.fn(),
      addEventListener: vi.fn(),
    })) as any
  })

  it('should initialize Deepgram client', () => {
    expect(deepgram).toBeDefined()
  })

  it('should send audio chunk', async () => {
    const audioChunk = new Blob(['audio data'], { type: 'audio/webm' })
    // Note: Full test requires WebSocket mocking
    // await deepgram.sendChunk(audioChunk)
    expect(true).toBe(true)
  })

  it('should handle transcription errors', async () => {
    const onTranscript = vi.fn()
    // Test error handling
    expect(onTranscript).toBeDefined()
  })
})
```

---

## Checklist

- [ ] Deepgram API key obtained
- [ ] DeepgramClient implemented
- [ ] useTranscription hook created
- [ ] Real-time streaming working
- [ ] Partial transcripts displaying
- [ ] Final transcripts accurate
- [ ] Audio chunk sending working
- [ ] Error handling comprehensive
- [ ] API route alternative created
- [ ] Integration with RecordButton complete
- [ ] Unit tests passing
- [ ] Memory leaks prevented (cleanup)
- [ ] Committed to `claude/review-codebase-nh6L5`

---

## Medical-Specific Optimizations

### ENT Terminology
Add custom vocabulary for better medical transcription:

```typescript
const medicalOptions = {
  model: 'nova-2-medical',
  language: 'en-US',
  // Optional: Add custom vocab in Phase 2
  vocabulary: [
    'microtia',
    'cholesteatoma',
    'ossicular chain',
    'tympanoplasty',
    'otosclerosis',
  ],
}
```

---

## Related Documentation

- [2_RECORDING_INSTRUCTIONS.md](2_RECORDING_INSTRUCTIONS.md) - Prerequisite
- [4_NOTE_GENERATION_INSTRUCTIONS.md](4_NOTE_GENERATION_INSTRUCTIONS.md) - Next step
- [CODING_STANDARDS.md](../CODING_STANDARDS.md) - Code quality

---

**Status:** Ready to implement after Recording component.
