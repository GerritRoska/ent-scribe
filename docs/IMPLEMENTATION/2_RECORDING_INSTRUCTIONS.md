# 2. Recording (RECORDING) - Implementation Instructions

**Component:** Audio recording interface, patient demographics, pause/resume
**Owner:** [Assign developer]
**Status:** NOT STARTED
**Estimated Time:** 2-3 days
**Dependencies:** Auth component (1_AUTH_INSTRUCTIONS.md)

---
> After completing this module, update `docs/IMPLEMENTATION_ROADMAP.md` and `docs/STATUS.md`.

## Objective

Implement a seamless audio recording experience that:
1. Captures patient visit audio with Web Audio API
2. Shows real-time transcript from Deepgram
3. Supports pause/resume functionality
4. Captures patient demographics (name, DOB, MRN)
5. Manages recording state and errors

---

## Requirements

### Functional Requirements

#### 2.1 Recording UI
```
✅ Start recording button
✅ Recording timer (HH:MM:SS)
✅ Pause/resume buttons (during recording)
✅ Cancel button (discard without saving)
✅ Stop button (end recording, prepare for generation)
✅ Real-time transcript display
✅ Visual recording indicator (red dot, waveform animation)
✅ Microphone permission request
✅ Error messages for mic access denied
```

#### 2.2 Patient Demographics
```
✅ Patient name input (auto-filled if resuming)
✅ Date of birth picker
✅ MRN input (optional)
✅ Patient can be marked as anonymous
✅ Save to session for next visit
```

#### 2.3 Technical Requirements
```
✅ Audio chunks recorded at 16kHz (Deepgram standard)
✅ Chunked every 1-2 seconds for streaming to Deepgram
✅ Handle microphone permissions (request + explain)
✅ Pause/resume without losing transcript continuity
✅ Stop recording gracefully (flush final audio chunk)
✅ Error handling for audio device issues
✅ Support Chrome, Safari, Firefox, Edge
```

---

## Technical Implementation

### 1. Audio Capture Setup

#### Step 1.1: Create Recording Hook
`lib/hooks/useRecording.ts`:
```typescript
import { useRef, useState, useCallback } from 'react'

interface RecordingState {
  isRecording: boolean
  isPaused: boolean
  duration: number
  transcript: string
  audioContext: AudioContext | null
  mediaStream: MediaStream | null
}

export function useRecording(onTranscriptUpdate: (text: string) => void) {
  const [state, setState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    transcript: '',
    audioContext: null,
    mediaStream: null,
  })

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  // Start recording
  const startRecording = useCallback(async () => {
    try {
      // Request microphone permission
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Deepgram standard
        },
      })

      // Create MediaRecorder
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      })

      const audioChunks: BlobPart[] = []
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
        // Send chunk to Deepgram (streaming)
        onAudioChunk(event.data) // TODO: implement
      }

      mediaRecorder.onstart = () => {
        setState((prev) => ({
          ...prev,
          isRecording: true,
          isPaused: false,
        }))
        // Start duration timer
        timerRef.current = setInterval(() => {
          setState((prev) => ({
            ...prev,
            duration: prev.duration + 1,
          }))
        }, 1000)
      }

      mediaRecorder.onpause = () => {
        setState((prev) => ({ ...prev, isPaused: true }))
      }

      mediaRecorder.onresume = () => {
        setState((prev) => ({ ...prev, isPaused: false }))
      }

      mediaRecorderRef.current = mediaRecorder
      mediaRecorder.start(1000) // Emit data every 1 second for streaming

      setState((prev) => ({ ...prev, mediaStream: stream }))
    } catch (error) {
      console.error('Microphone access denied:', error)
      throw new Error('Unable to access microphone. Please check permissions.')
    }
  }, [])

  // Pause recording
  const pauseRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.pause()
    }
  }, [])

  // Resume recording
  const resumeRecording = useCallback(() => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.resume()
    }
  }, [])

  // Stop recording
  const stopRecording = useCallback((): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      if (!mediaRecorderRef.current) {
        reject(new Error('No active recording'))
        return
      }

      const mediaRecorder = mediaRecorderRef.current
      const audioChunks: BlobPart[] = []

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data)
      }

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
        resolve(audioBlob)

        // Cleanup
        if (state.mediaStream) {
          state.mediaStream.getTracks().forEach((track) => track.stop())
        }
        if (timerRef.current) {
          clearInterval(timerRef.current)
        }

        setState({
          isRecording: false,
          isPaused: false,
          duration: 0,
          transcript: '',
          audioContext: null,
          mediaStream: null,
        })
      }

      mediaRecorder.stop()
    })
  }, [state.mediaStream])

  // Cancel recording
  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && state.isRecording) {
      mediaRecorderRef.current.stop()
    }
    // Stop audio tracks
    if (state.mediaStream) {
      state.mediaStream.getTracks().forEach((track) => track.stop())
    }
    // Clear timer
    if (timerRef.current) {
      clearInterval(timerRef.current)
    }

    setState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      transcript: '',
      audioContext: null,
      mediaStream: null,
    })
  }, [state.isRecording, state.mediaStream])

  return {
    state,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    cancelRecording,
    updateTranscript: (text: string) =>
      setState((prev) => ({ ...prev, transcript: text })),
  }
}
```

### 2. Recording UI Component

#### Step 2.2: Create RecordButton Component
`components/recording/RecordButton.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRecording } from '@/lib/hooks/useRecording'

interface RecordButtonProps {
  onRecordingComplete: (audioBlob: Blob, transcript: string) => void
}

export default function RecordButton({ onRecordingComplete }: RecordButtonProps) {
  const [error, setError] = useState<string | null>(null)
  const { state, startRecording, pauseRecording, resumeRecording, stopRecording, cancelRecording } = useRecording(
    (transcript) => {
      // Update transcript display
    }
  )

  const handleStart = async () => {
    try {
      setError(null)
      await startRecording()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start recording')
    }
  }

  const handleStop = async () => {
    try {
      const audioBlob = await stopRecording()
      onRecordingComplete(audioBlob, state.transcript)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to stop recording')
    }
  }

  const formatDuration = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600)
    const mins = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      {/* Recording Status */}
      <div className="flex items-center gap-4 mb-6">
        {state.isRecording && (
          <div className="flex items-center gap-2">
            <div className="animate-pulse w-4 h-4 bg-red-600 rounded-full"></div>
            <span className="text-red-600 font-semibold">Recording</span>
          </div>
        )}
        {state.isPaused && (
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
            <span className="text-yellow-600 font-semibold">Paused</span>
          </div>
        )}
        <span className="text-2xl font-mono font-bold text-gray-700">
          {formatDuration(state.duration)}
        </span>
      </div>

      {/* Real-time Transcript */}
      {state.transcript && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-gray-600 mb-2">Real-time Transcript:</p>
          <p className="text-gray-800">{state.transcript}</p>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Control Buttons */}
      <div className="flex gap-4 flex-wrap">
        {!state.isRecording ? (
          <button
            onClick={handleStart}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
          >
            🎤 Start Recording
          </button>
        ) : (
          <>
            {!state.isPaused ? (
              <button
                onClick={pauseRecording}
                className="flex-1 bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeRecording}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                ▶️ Resume
              </button>
            )}

            <button
              onClick={handleStop}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              ⏹️ Stop & Generate
            </button>

            <button
              onClick={cancelRecording}
              className="flex-1 bg-gray-400 hover:bg-gray-500 text-white font-bold py-3 px-6 rounded-lg transition"
            >
              ❌ Cancel
            </button>
          </>
        )}
      </div>
    </div>
  )
}
```

#### Step 2.3: Patient Demographics Form
`components/recording/PatientForm.tsx`:
```typescript
'use client'

import { useState } from 'react'

interface PatientInfo {
  name: string
  dateOfBirth: string
  mrn: string
  anonymous: boolean
}

interface PatientFormProps {
  onSubmit: (info: PatientInfo) => void
  defaultValues?: Partial<PatientInfo>
}

export default function PatientForm({ onSubmit, defaultValues }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientInfo>({
    name: defaultValues?.name || '',
    dateOfBirth: defaultValues?.dateOfBirth || '',
    mrn: defaultValues?.mrn || '',
    anonymous: defaultValues?.anonymous || false,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-6 bg-white rounded-lg shadow">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Patient Name
        </label>
        <input
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="John Doe"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Date of Birth
        </label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={(e) =>
            setFormData({ ...formData, dateOfBirth: e.target.value })
          }
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          MRN (Optional)
        </label>
        <input
          type="text"
          value={formData.mrn}
          onChange={(e) => setFormData({ ...formData, mrn: e.target.value })}
          placeholder="12345678"
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
        />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input
          type="checkbox"
          checked={formData.anonymous}
          onChange={(e) =>
            setFormData({ ...formData, anonymous: e.target.checked })
          }
        />
        <span className="text-sm text-gray-700">Anonymous patient</span>
      </label>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition"
      >
        Continue to Recording
      </button>
    </form>
  )
}
```

### 3. Recording Page

#### Step 3.1: Create Recording Page
`app/record/page.tsx`:
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import PatientForm from '@/components/recording/PatientForm'
import RecordButton from '@/components/recording/RecordButton'
import Sidebar from '@/components/Sidebar'

export default function RecordPage() {
  const [patientInfo, setPatientInfo] = useState(null)
  const router = useRouter()

  const handleRecordingComplete = async (audioBlob: Blob, transcript: string) => {
    // Save to session/state for note generation
    sessionStorage.setItem('recordingData', JSON.stringify({
      audioBlob: audioBlob,
      transcript: transcript,
      patientInfo: patientInfo,
    }))

    // Redirect to note generation
    router.push('/note')
  }

  return (
    <div className="flex">
      <Sidebar />
      <main className="flex-1 p-8 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8">Record Patient Visit</h1>

          {!patientInfo ? (
            <PatientForm onSubmit={setPatientInfo} />
          ) : (
            <>
              <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-gray-600">
                  Patient: <strong>{patientInfo.name}</strong>
                </p>
              </div>
              <RecordButton onRecordingComplete={handleRecordingComplete} />
            </>
          )}
        </div>
      </main>
    </div>
  )
}
```

---

## 4. Error Handling

### Common Errors

#### Microphone Permission Denied
```typescript
try {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
} catch (error) {
  if (error.name === 'NotAllowedError') {
    // User denied permission
    showError('Microphone access denied. Please enable in browser settings.')
  } else if (error.name === 'NotFoundError') {
    // No microphone found
    showError('No microphone detected. Please connect a microphone.')
  } else {
    showError('Unable to access microphone.')
  }
}
```

#### Audio Device Disconnect
```typescript
navigator.mediaDevices.addEventListener('devicechange', () => {
  // Reload devices or warn user
  console.warn('Audio device changed. Recording may be interrupted.')
})
```

---

## 5. Testing

#### __tests__/recording.test.ts
```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import RecordButton from '@/components/recording/RecordButton'

describe('Recording', () => {
  beforeEach(() => {
    // Mock getUserMedia
    global.navigator.mediaDevices = {
      getUserMedia: vi.fn().mockResolvedValue({
        getTracks: () => [],
      }),
    }
  })

  it('should start recording on button click', async () => {
    render(<RecordButton onRecordingComplete={vi.fn()} />)
    const startButton = screen.getByText('Start Recording')
    fireEvent.click(startButton)
    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalled()
  })

  it('should show pause button during recording', async () => {
    const { rerender } = render(
      <RecordButton onRecordingComplete={vi.fn()} />
    )
    const startButton = screen.getByText('Start Recording')
    fireEvent.click(startButton)
    rerender(<RecordButton onRecordingComplete={vi.fn()} />)
    expect(screen.getByText('⏸️ Pause')).toBeInTheDocument()
  })

  it('should format duration correctly', () => {
    const { getByText } = render(
      <RecordButton onRecordingComplete={vi.fn()} />
    )
    // Duration should be 00:00:00 at start
    expect(getByText('00:00:00')).toBeInTheDocument()
  })
})
```

---

## Checklist

- [ ] useRecording hook implemented
- [ ] RecordButton component functional
- [ ] PatientForm component functional
- [ ] Recording page created
- [ ] Microphone permissions handled
- [ ] Pause/resume working
- [ ] Stop recording gracefully
- [ ] Duration timer accurate
- [ ] Real-time transcript display
- [ ] Error handling comprehensive
- [ ] Unit tests passing
- [ ] WCAG AA accessibility verified
- [ ] Committed to `claude/review-codebase-nh6L5`

---

## Related Documentation

- [1_AUTH_INSTRUCTIONS.md](1_AUTH_INSTRUCTIONS.md) - Prerequisite
- [3_TRANSCRIPTION_INSTRUCTIONS.md](3_TRANSCRIPTION_INSTRUCTIONS.md) - Next step
- [CODING_STANDARDS.md](../CODING_STANDARDS.md) - Code quality
- [THEME.md](../THEME.md) - Design system

---

**Status:** Ready to implement after Auth component.
