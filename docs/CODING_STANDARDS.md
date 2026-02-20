# ENT Scribe v1 - Coding Standards & Best Practices

A comprehensive reference guide for all development work on ENT Scribe, a medical-grade SaaS application serving 1000+ users. These standards ensure consistency, security, reliability, and maintainability across the entire codebase.

**Version:** 1.0
**Last Updated:** February 2026
**Target:** Medical SaaS with HIPAA considerations and 1000+ concurrent users

---

## Table of Contents

1. [Code Organization](#code-organization)
2. [TypeScript Standards](#typescript-standards)
3. [React/Next.js Best Practices](#reactnextjs-best-practices)
4. [API Route Standards](#api-route-standards)
5. [State Management](#state-management)
6. [Error Handling](#error-handling)
7. [Security](#security)
8. [Testing Standards](#testing-standards)
9. [Git Conventions](#git-conventions)
10. [Performance](#performance)
11. [Accessibility](#accessibility)
12. [Data Handling](#data-handling)
13. [Logging & Monitoring](#logging--monitoring)
14. [Documentation](#documentation)

---

## Code Organization

### File Structure

```
ent-scribe/
├── app/                      # Next.js App Router (pages and routes)
│   ├── api/                 # API routes
│   │   ├── [resource]/
│   │   │   ├── route.ts     # GET, POST, PUT, DELETE handlers
│   │   │   └── [id]/
│   │   │       └── route.ts # Single resource operations
│   │   └── health/
│   │       └── route.ts     # Health check endpoint
│   ├── (auth)/              # Auth-related pages (grouped)
│   ├── (protected)/         # Protected/authenticated pages
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Home page
│   └── globals.css          # Global styles
├── components/              # Reusable React components
│   ├── common/             # Shared components (Button, Card, Modal)
│   ├── features/           # Feature-specific components
│   ├── forms/              # Form components
│   ├── layouts/            # Layout components
│   └── hooks/              # Custom React hooks (optional subdirectory)
├── lib/                     # Utility functions and helpers
│   ├── api/                # API client utilities
│   ├── auth/               # Authentication helpers
│   ├── constants.ts        # Application constants
│   ├── types.ts            # Shared TypeScript types
│   ├── utils.ts            # General utilities
│   ├── validation.ts       # Input validation schemas
│   ├── security.ts         # Security utilities
│   └── logger.ts           # Logging configuration
├── hooks/                   # Custom React hooks (if many)
│   ├── useAuth.ts
│   ├── useLocalStorage.ts
│   └── useFetch.ts
├── public/                  # Static assets
│   ├── icons/
│   └── images/
├── types/                   # Shared TypeScript type definitions
│   ├── api.ts              # API request/response types
│   ├── domain.ts           # Business domain types (Patient, Note, etc.)
│   ├── errors.ts           # Error types
│   └── index.ts            # Re-exports for convenience
├── tests/                   # Test files (mirrors source structure)
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── .env.example             # Environment variable template
├── .env.local              # Local environment (git-ignored)
├── eslint.config.mjs       # ESLint configuration
├── next.config.ts          # Next.js configuration
├── package.json            # Dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── CODING_STANDARDS.md     # This file
```

### Naming Conventions

#### Files and Directories

- **Directories:** kebab-case (`components/form-fields`, `lib/api-client`)
- **Component files:** PascalCase (`RecordButton.tsx`, `PatientCard.tsx`)
- **Utility/helper files:** camelCase (`formatDate.ts`, `validateEmail.ts`)
- **API routes:** Use resource names in snake_case or plurals
  ```
  /api/patients
  /api/patients/[patientId]
  /api/notes
  /api/audio/transcribe
  ```
- **Type files:** PascalCase or suffixed (`User.ts`, `user.types.ts`)

#### Variables and Functions

- **Constants:** UPPER_SNAKE_CASE for application-wide constants
  ```typescript
  const MAX_AUDIO_FILE_SIZE = 50 * 1024 * 1024; // 50MB
  const API_TIMEOUT_MS = 30000;
  const HIPAA_RETENTION_DAYS = 2555; // 7 years
  ```

- **Variables:** camelCase (`userEmail`, `isLoading`, `patientData`)
- **Functions:** camelCase for functions and methods (`formatDate()`, `fetchPatient()`)
- **React components/classes:** PascalCase (`RecordButton`, `PatientForm`, `AudioService`)
- **Boolean variables:** Prefix with `is`, `has`, `should`, `can`
  ```typescript
  const isLoading = false;
  const hasError = true;
  const shouldRetry = true;
  const canDeleteRecord = userRole === 'admin';
  ```

#### Import/Export Ordering

Within each file, organize imports in this order:
1. External dependencies (React, Next.js, third-party)
2. Type imports
3. Absolute imports (from `@/`)
4. Relative imports

```typescript
import { useState, useCallback } from 'react';
import type { Metadata } from 'next';
import { headers } from 'next/headers';

import type { Patient, Note } from '@/types/domain';
import { validateEmail } from '@/lib/validation';

import { SidebarNav } from './SidebarNav';
import PatientCard from './PatientCard';
```

---

## TypeScript Standards

### Strict Mode (Required)

All files must compile with TypeScript strict mode enabled. This is enforced via `tsconfig.json`:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true
  }
}
```

### Type Definitions

#### Use Explicit Types

Never rely on implicit `any`. Always define types explicitly.

```typescript
// ❌ AVOID - Implicit any
function processData(data) {
  return data.filter(item => item.active);
}

// ✅ CORRECT - Explicit types
function processData(data: Patient[]): Patient[] {
  return data.filter(item => item.active);
}
```

#### Define Interfaces for Objects

Use interfaces for object shapes, especially for API responses and domain entities.

```typescript
// lib/types.ts or types/domain.ts
interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  mrn: string; // Medical Record Number - HIPAA protected
  dateOfBirth: Date;
  email: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

interface Note {
  id: string;
  patientId: string;
  transcript: string;
  generatedContent: string;
  duration: number; // seconds
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: Record<string, unknown>;
  };
  timestamp: string;
}
```

#### Use Union Types for State Variants

Represent different states using discriminated unions instead of multiple boolean flags.

```typescript
// ❌ AVOID - Multiple booleans
interface RecordingState {
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  data?: string;
  error?: string;
}

// ✅ CORRECT - Discriminated union
type RecordingState =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: string }
  | { status: 'error'; error: string };

function handleState(state: RecordingState) {
  switch (state.status) {
    case 'idle':
      // safe; only 'idle' properties available
      break;
    case 'success':
      console.log(state.data); // ✅ data is guaranteed to exist
      break;
    case 'error':
      console.log(state.error); // ✅ error is guaranteed to exist
  }
}
```

#### Generic Types for Reusability

Use generics for flexible, reusable types.

```typescript
interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
  createdAt: number;
}
```

#### Readonly Properties

Mark immutable data as `readonly` to prevent accidental mutations.

```typescript
interface Config {
  readonly apiUrl: string;
  readonly maxRetries: number;
  readonly timeoutMs: number;
}

type ReadonlyPatient = Readonly<Patient>;
```

### Function Signatures

Always specify return types explicitly.

```typescript
// ❌ AVOID
function calculateDuration(startTime, endTime) {
  return endTime - startTime;
}

// ✅ CORRECT
function calculateDuration(startTime: Date, endTime: Date): number {
  return endTime.getTime() - startTime.getTime();
}

// ✅ Async functions should return Promise
async function fetchPatientData(patientId: string): Promise<Patient> {
  const response = await fetch(`/api/patients/${patientId}`);
  return response.json();
}

// ✅ Optional parameters
function getUserName(user: User, includeTitle?: boolean): string {
  return includeTitle ? `${user.title} ${user.name}` : user.name;
}

// ✅ With defaults
function retryRequest(
  url: string,
  options: RequestOptions = DEFAULT_REQUEST_OPTIONS
): Promise<Response> {
  // implementation
}
```

### Avoid `any` Type

The `any` type defeats TypeScript's purpose. Use alternatives:

```typescript
// ❌ AVOID
function handleResponse(data: any) {
  return data.result;
}

// ✅ CORRECT - Use specific types
function handleResponse<T>(data: ApiResponse<T>): T | null {
  return data.success ? data.data : null;
}

// ✅ Use unknown for truly unknown types
function parseUnknown(input: unknown): string {
  if (typeof input === 'string') return input;
  if (typeof input === 'number') return input.toString();
  throw new Error('Unexpected type');
}
```

---

## React/Next.js Best Practices

### Component Organization

#### Functional Components Only

All React components must be functional components using hooks. Class components are **not** used.

```typescript
// ✅ CORRECT
export default function PatientForm({ onSubmit }: PatientFormProps) {
  const [formData, setFormData] = useState<PatientFormData>(initialValues);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return <form onSubmit={handleSubmit}>{/* JSX */}</form>;
}

// ❌ AVOID - Class components
class PatientForm extends React.Component {
  // ...
}
```

#### Component Props Interface

Always define a props interface/type for all components.

```typescript
// ✅ CORRECT
interface RecordButtonProps {
  onTranscriptChunk: (text: string) => void;
  onRecordingComplete: (fullTranscript: string) => void;
  disabled?: boolean;
  maxDurationSeconds?: number;
}

export default function RecordButton({
  onTranscriptChunk,
  onRecordingComplete,
  disabled = false,
  maxDurationSeconds = 3600,
}: RecordButtonProps) {
  // implementation
}

// ❌ AVOID - No type definition
export default function RecordButton({ onTranscriptChunk, onRecordingComplete }) {
  // implicit any
}
```

#### Component Structure

Organize components in this order:
1. Imports
2. Type definitions (interfaces, types)
3. Constants
4. Sub-components (if any)
5. Main component function
6. Default export

```typescript
import { useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

import { AudioService } from '@/lib/audio-service';
import type { TranscriptionResult } from '@/types/domain';

// Constants
const CHUNK_SIZE_THRESHOLD = 1000; // bytes
const CHUNK_INTERVAL_MS = 30000; // 30 seconds

// Types
interface RecordButtonProps {
  onChunk?: (text: string) => void;
  onComplete: (transcript: string) => void;
}

// Sub-components
function RecordingIndicator() {
  return <div className="recording-pulse" />;
}

// Main component
export default function RecordButton({ onChunk, onComplete }: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);
  // ... rest of implementation
}
```

### Server vs Client Components

#### Server Components (Default)

Next.js App Router uses server components by default. Use them for:
- Fetching data from databases or APIs
- Keeping sensitive data (API keys) on the server
- Rendering static content
- Reducing bundle size

```typescript
// app/notes/page.tsx - Server Component (default)
import { getNotes } from '@/lib/db/notes';

export default async function NotesPage() {
  const notes = await getNotes();

  return (
    <div>
      {notes.map(note => (
        <NoteItem key={note.id} note={note} />
      ))}
    </div>
  );
}
```

#### Client Components

Use client components only when necessary:
- Interactivity (form submission, event listeners)
- React hooks (useState, useEffect, useContext)
- Browser APIs (localStorage, mediaDevices)

Always mark client components explicitly with `'use client'` at the top of the file.

```typescript
// components/RecordButton.tsx - Client Component
'use client';

import { useState, useCallback } from 'react';

interface RecordButtonProps {
  onTranscriptChunk: (text: string) => void;
}

export default function RecordButton({ onTranscriptChunk }: RecordButtonProps) {
  const [isRecording, setIsRecording] = useState(false);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // implementation
  }, []);

  return <button onClick={startRecording}>Record</button>;
}
```

### Hooks Usage

#### Rules of Hooks

1. **Only call hooks at the top level** - Never call hooks conditionally or in loops
2. **Only call from React function components** - Not from regular JavaScript functions
3. **Use ESLint plugin** - Enable `eslint-plugin-react-hooks` to enforce

```typescript
// ❌ AVOID - Conditional hook
function Component({ shouldUseAuth }: any) {
  if (shouldUseAuth) {
    const user = useAuth(); // ❌ WRONG!
  }
}

// ✅ CORRECT
function Component({ shouldUseAuth }: any) {
  const user = useAuth(); // Always called
  if (!shouldUseAuth) {
    return null;
  }
}
```

#### useCallback for Event Handlers

Wrap event handlers and callbacks in `useCallback` to prevent unnecessary re-renders.

```typescript
interface TranscriptViewProps {
  onEdit: (id: string, content: string) => void;
}

export default function TranscriptView({ onEdit }: TranscriptViewProps) {
  // ✅ Memoized callback - prevents child re-renders
  const handleEdit = useCallback(
    (id: string, content: string) => {
      onEdit(id, content);
    },
    [onEdit]
  );

  return <textarea onChange={(e) => handleEdit(id, e.target.value)} />;
}
```

#### useRef for Mutable Values

Use `useRef` for values that don't trigger re-renders, like DOM references or timers.

```typescript
export default function RecordButton() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder; // Mutable, doesn't trigger re-render
  }, []);

  const stopRecording = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  }, []);

  return <button onClick={startRecording}>Record</button>;
}
```

#### useEffect Dependencies

Always specify dependency arrays. Never use an empty array unless absolutely intentional.

```typescript
// ✅ CORRECT - Empty array: runs once on mount
useEffect(() => {
  loadInitialData();
}, []);

// ✅ CORRECT - With dependencies
useEffect(() => {
  const subscription = patientService.subscribe(patientId);
  return () => subscription.unsubscribe(); // Cleanup
}, [patientId]);

// ❌ AVOID - Missing dependencies
useEffect(() => {
  console.log(userId); // userId used but not in deps
}, []);
```

#### Custom Hooks

Create custom hooks for reusable logic. Prefix with `use`.

```typescript
// hooks/useLocalStorage.ts
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(key) : null;
    return stored ? JSON.parse(stored) : initialValue;
  });

  const setStoredValue = useCallback(
    (val: T | ((v: T) => T)) => {
      const newValue = val instanceof Function ? val(value) : val;
      setValue(newValue);
      localStorage.setItem(key, JSON.stringify(newValue));
    },
    [key, value]
  );

  return [value, setStoredValue] as const;
}

// Usage
'use client';
export default function Settings() {
  const [theme, setTheme] = useLocalStorage('theme', 'light');
  return <button onClick={() => setTheme('dark')}>Dark Mode</button>;
}
```

---

## API Route Standards

### Route Organization

API routes should be organized by resource:

```
/api/
  /health
    route.ts           # Health check
  /audio
    /transcribe
      route.ts         # POST: transcribe audio
  /notes
    route.ts           # GET: list notes, POST: create note
    /[noteId]
      route.ts         # GET: retrieve note, PUT: update, DELETE: delete
  /patients
    route.ts           # GET: list (paginated), POST: create patient
    /[patientId]
      route.ts         # GET: retrieve, PUT: update
      /notes
        route.ts       # GET: list notes for patient
```

### Request/Response Handling

#### Type-Safe Request/Response

```typescript
// types/api.ts
export interface TranscribeRequest {
  audio: Blob;
}

export interface TranscribeResponse {
  text: string;
  confidence?: number;
  duration: number;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponseWrapper<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  timestamp: string;
}
```

#### Standard Response Format

All API responses must follow a consistent structure:

```typescript
// app/api/notes/route.ts
import { NextRequest, NextResponse } from 'next/server';
import type { Note } from '@/types/domain';
import type { ApiResponseWrapper } from '@/types/api';

export async function GET(req: NextRequest): Promise<NextResponse<ApiResponseWrapper<Note[]>>> {
  try {
    const notes = await fetchNotes();

    return NextResponse.json<ApiResponseWrapper<Note[]>>(
      {
        success: true,
        data: notes,
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json<ApiResponseWrapper<Note[]>>(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch notes',
        },
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponseWrapper<Note>>> {
  try {
    const body = await req.json();
    const note = await createNote(body);

    return NextResponse.json<ApiResponseWrapper<Note>>(
      {
        success: true,
        data: note,
        timestamp: new Date().toISOString(),
      },
      { status: 201 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
```

### Input Validation

Validate all inputs before processing:

```typescript
// lib/validation.ts
import { z } from 'zod'; // Consider using Zod for runtime validation

export const transcribeSchema = z.object({
  audioBlob: z.instanceof(Blob),
  format: z.enum(['webm', 'mp3', 'wav']).optional(),
});

export const noteSchema = z.object({
  patientId: z.string().uuid(),
  transcript: z.string().min(1).max(10000),
  generatedContent: z.string().max(50000),
});

export const patientSchema = z.object({
  firstName: z.string().min(1).max(100),
  lastName: z.string().min(1).max(100),
  email: z.string().email(),
  mrn: z.string().min(1).max(20), // Medical Record Number
  dateOfBirth: z.coerce.date(),
});

// app/api/notes/route.ts
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const validated = noteSchema.parse(body);
    // Process validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid request data',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }
  }
}
```

### Error Handling in Routes

```typescript
// lib/api-errors.ts
export class ApiError extends Error {
  constructor(
    public code: string,
    public message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class UnauthorizedError extends ApiError {
  constructor() {
    super('UNAUTHORIZED', 'Authentication required', 401);
  }
}

// app/api/audio/transcribe/route.ts
import type { ApiResponseWrapper } from '@/types/api';
import { ValidationError, ApiError } from '@/lib/api-errors';

function createErrorResponse<T>(error: unknown, fallbackStatus = 500) {
  if (error instanceof ApiError) {
    return NextResponse.json<ApiResponseWrapper<T>>(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Unknown error
  console.error('Unhandled API error:', error);
  return NextResponse.json<ApiResponseWrapper<T>>(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const audioBlob = formData.get('audio') as Blob | null;

    if (!audioBlob) {
      throw new ValidationError('No audio file provided');
    }

    if (audioBlob.size === 0) {
      throw new ValidationError('Audio file is empty');
    }

    const text = await transcribeAudio(audioBlob);

    return NextResponse.json<ApiResponseWrapper<{ text: string }>>(
      {
        success: true,
        data: { text },
        timestamp: new Date().toISOString(),
      },
      { status: 200 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### Rate Limiting

Implement rate limiting for API endpoints handling sensitive operations or external API calls:

```typescript
// lib/rate-limit.ts
const requestCounts = new Map<string, { count: number; resetAt: number }>();

export function getRateLimitKey(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for') ||
             req.headers.get('x-real-ip') ||
             'unknown';
  return ip;
}

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || record.resetAt < now) {
    // New window
    requestCounts.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxRequests - 1, resetAt: now + windowMs };
  }

  const allowed = record.count < maxRequests;
  record.count++;

  return {
    allowed,
    remaining: Math.max(0, maxRequests - record.count),
    resetAt: record.resetAt,
  };
}

// app/api/audio/transcribe/route.ts
export async function POST(req: NextRequest) {
  const key = getRateLimitKey(req);
  const { allowed, remaining, resetAt } = checkRateLimit(key, 100, 60000); // 100 req/min

  if (!allowed) {
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'RATE_LIMITED',
          message: 'Too many requests. Please try again later.',
          details: { resetAt },
        },
      },
      {
        status: 429,
        headers: {
          'X-RateLimit-Remaining': remaining.toString(),
          'X-RateLimit-Reset': new Date(resetAt).toISOString(),
        },
      }
    );
  }

  // Continue processing request
}
```

---

## State Management

### localStorage for Persistent Data

Use localStorage for user preferences and non-sensitive data that persists across sessions.

```typescript
// hooks/useLocalStorage.ts
'use client';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue;

    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage[${key}]:`, error);
      return initialValue;
    }
  });

  const setStoredValue = useCallback(
    (val: T | ((v: T) => T)) => {
      try {
        const newValue = val instanceof Function ? val(value) : val;
        setValue(newValue);
        localStorage.setItem(key, JSON.stringify(newValue));
      } catch (error) {
        console.error(`Error writing localStorage[${key}]:`, error);
      }
    },
    [key, value]
  );

  return [value, setStoredValue] as const;
}

// Usage
'use client';
export default function NoteEditor() {
  const [savedDraft, setSavedDraft] = useLocalStorage<string>('note-draft', '');

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setSavedDraft(e.target.value);
  };

  return <textarea value={savedDraft} onChange={handleChange} />;
}
```

### Context API for App-Wide State

Use React Context for shared state that multiple components need access to:

```typescript
// lib/context/auth-context.tsx
'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'physician' | 'admin';
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      setUser(data.user);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

// app/layout.tsx
import { AuthProvider } from '@/lib/context/auth-context';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

// Usage in component
'use client';
import { useAuth } from '@/lib/context/auth-context';

export default function UserMenu() {
  const { user, logout } = useAuth();

  if (!user) return null;

  return (
    <div>
      <span>{user.name}</span>
      <button onClick={logout}>Logout</button>
    </div>
  );
}
```

### Custom Hooks for Complex Logic

Extract complex state logic into custom hooks:

```typescript
// hooks/useFetch.ts
'use client';

import { useState, useEffect, useCallback } from 'react';

interface UseFetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  headers?: Record<string, string>;
  body?: unknown;
  skip?: boolean;
}

interface UseFetchState<T> {
  data: T | null;
  isLoading: boolean;
  error: Error | null;
}

export function useFetch<T>(
  url: string,
  options: UseFetchOptions = {}
): UseFetchState<T> & { refetch: () => Promise<void> } {
  const [state, setState] = useState<UseFetchState<T>>({
    data: null,
    isLoading: true,
    error: null,
  });

  const fetchData = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setState({ data, isLoading: false, error: null });
    } catch (error) {
      setState({
        data: null,
        isLoading: false,
        error: error instanceof Error ? error : new Error(String(error)),
      });
    }
  }, [url, options.method, options.body]);

  useEffect(() => {
    if (!options.skip) {
      fetchData();
    }
  }, [fetchData, options.skip]);

  return { ...state, refetch: fetchData };
}

// Usage
'use client';
export default function NotesList() {
  const { data: notes, isLoading, error, refetch } = useFetch<Note[]>('/api/notes');

  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div>
      {notes?.map(note => (
        <NoteItem key={note.id} note={note} />
      ))}
      <button onClick={() => refetch()}>Refresh</button>
    </div>
  );
}
```

---

## Error Handling

### Try-Catch Pattern with Specific Error Types

```typescript
// lib/errors.ts
export class ApplicationError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
    public details?: Record<string, unknown>
  ) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ApplicationError {
  constructor(message: string, details?: Record<string, unknown>) {
    super('VALIDATION_ERROR', message, 400, details);
  }
}

export class NotFoundError extends ApplicationError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class UnauthorizedError extends ApplicationError {
  constructor(message: string = 'Authentication required') {
    super('UNAUTHORIZED', message, 401);
  }
}

export class ForbiddenError extends ApplicationError {
  constructor(message: string = 'Insufficient permissions') {
    super('FORBIDDEN', message, 403);
  }
}

export class ConflictError extends ApplicationError {
  constructor(message: string) {
    super('CONFLICT', message, 409);
  }
}

export class InternalError extends ApplicationError {
  constructor(message: string = 'Internal server error') {
    super('INTERNAL_ERROR', message, 500);
  }
}
```

### API Route Error Handling

```typescript
// app/api/notes/[noteId]/route.ts
import type { NextRequest, NextResponse } from 'next/server';
import {
  NotFoundError,
  UnauthorizedError,
  ApplicationError,
} from '@/lib/errors';
import { logger } from '@/lib/logger';

function createErrorResponse<T>(
  error: unknown
): NextResponse<ApiResponseWrapper<T>> {
  if (error instanceof ApplicationError) {
    logger.warn(`API Error [${error.code}]: ${error.message}`, {
      code: error.code,
      statusCode: error.statusCode,
      details: error.details,
    });

    return NextResponse.json<ApiResponseWrapper<T>>(
      {
        success: false,
        error: {
          code: error.code,
          message: error.message,
          details: error.details,
        },
        timestamp: new Date().toISOString(),
      },
      { status: error.statusCode }
    );
  }

  // Unexpected error
  logger.error('Unhandled API error', error);

  return NextResponse.json<ApiResponseWrapper<T>>(
    {
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'An unexpected error occurred',
      },
      timestamp: new Date().toISOString(),
    },
    { status: 500 }
  );
}

export async function GET(
  _req: NextRequest,
  { params }: { params: { noteId: string } }
): Promise<NextResponse> {
  try {
    const note = await fetchNote(params.noteId);
    if (!note) {
      throw new NotFoundError('Note');
    }

    return NextResponse.json({ success: true, data: note });
  } catch (error) {
    return createErrorResponse(error);
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: { noteId: string } }
): Promise<NextResponse> {
  try {
    const user = await validateAuthorization(req);
    if (!user) {
      throw new UnauthorizedError();
    }

    await deleteNote(params.noteId, user.id);

    return NextResponse.json(
      { success: true },
      { status: 204 }
    );
  } catch (error) {
    return createErrorResponse(error);
  }
}
```

### Client-Side Error Handling

```typescript
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';
import { logger } from '@/lib/logger';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('React Error Boundary caught error', {
      error: error.message,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="error-container">
          <h1>Something went wrong</h1>
          <p>{this.state.error?.message}</p>
          <button onClick={() => window.location.reload()}>Reload Page</button>
        </div>
      );
    }

    return this.props.children;
  }
}

// app/layout.tsx
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html>
      <body>
        <ErrorBoundary>{children}</ErrorBoundary>
      </body>
    </html>
  );
}
```

### User-Facing Error Messages

Always provide clear, actionable error messages to users:

```typescript
// lib/error-messages.ts
export const UserErrorMessages: Record<string, string> = {
  VALIDATION_ERROR: 'Please check your input and try again.',
  NOT_FOUND: 'The resource you requested could not be found.',
  UNAUTHORIZED: 'Please log in to continue.',
  FORBIDDEN: 'You do not have permission to perform this action.',
  CONFLICT: 'This resource already exists.',
  RATE_LIMITED: 'You are making requests too quickly. Please wait a moment.',
  INTERNAL_ERROR: 'Something went wrong. Please try again later.',
  NETWORK_ERROR: 'Connection error. Please check your internet.',
  AUDIO_ERROR: 'Failed to process audio. Please try recording again.',
  TRANSCRIPTION_ERROR: 'Failed to transcribe audio. Please try again.',
};

export function getErrorMessage(code: string): string {
  return UserErrorMessages[code] || 'An error occurred. Please try again.';
}

// Usage in component
'use client';
import { getErrorMessage } from '@/lib/error-messages';

export default function RecordButton() {
  const [error, setError] = useState<string | null>(null);

  const handleRecord = async () => {
    try {
      // ... recording logic
    } catch (err) {
      const errorCode = err instanceof Error ? err.message : 'INTERNAL_ERROR';
      setError(getErrorMessage(errorCode));
    }
  };

  return (
    <>
      {error && <div className="error-toast">{error}</div>}
      <button onClick={handleRecord}>Record</button>
    </>
  );
}
```

---

## Security

### HIPAA Compliance Fundamentals

ENT Scribe handles Protected Health Information (PHI). All HIPAA requirements must be met:

**Key HIPAA Rules:**
- Patient data must be encrypted in transit (HTTPS/TLS) and at rest
- Access must be limited to authorized users
- Data access must be logged and monitored
- Patient data must not be transmitted to non-HIPAA-compliant third parties
- Security assessments must be conducted regularly
- Breach notification procedures must be in place

```typescript
// lib/hipaa.ts
// HIPAA compliance constants and utilities

export const HIPAA_CONFIG = {
  // Data retention: 7 years (2555 days) per HIPAA requirements
  DATA_RETENTION_DAYS: 2555,
  // Minimum password length: 12 characters
  MIN_PASSWORD_LENGTH: 12,
  // Session timeout: 30 minutes of inactivity
  SESSION_TIMEOUT_MS: 30 * 60 * 1000,
  // Audit log retention: 6 years minimum
  AUDIT_LOG_RETENTION_DAYS: 2190,
  // Failed login attempts before account lockout
  MAX_FAILED_ATTEMPTS: 5,
  // Account lockout duration
  ACCOUNT_LOCKOUT_DURATION_MS: 30 * 60 * 1000,
} as const;

// PII/PHI fields that require special handling
export const SENSITIVE_FIELDS = new Set([
  'ssn',
  'mrn', // Medical Record Number
  'dateOfBirth',
  'socialSecurityNumber',
  'medicalRecordNumber',
  'insuranceId',
  'phoneNumber',
  'email',
  'address',
  'city',
  'state',
  'zipCode',
]);

/**
 * Checks if a string contains potentially sensitive information
 */
export function containsSensitiveData(text: string): boolean {
  const patterns = [
    /\d{3}-\d{2}-\d{4}/, // SSN format
    /\d{10,}/, // Long numbers (might be MRN)
    /\b\d{5}-\d{4}\b/, // ZIP+4
  ];

  return patterns.some(pattern => pattern.test(text));
}
```

### API Key and Credential Management

Never commit API keys, passwords, or credentials to version control:

```typescript
// ❌ NEVER DO THIS
const OPENAI_API_KEY = 'sk-proj-abc123...';

// ✅ CORRECT - Use environment variables
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// .env.example (NEVER commit secrets, only template)
OPENAI_API_KEY=your_key_here
DATABASE_URL=your_database_url
NEXT_PUBLIC_API_URL=http://localhost:3000

// .gitignore (ensure this is in place)
.env.local
.env*.local
.env.*.local
```

### PII Protection

Never log or expose personally identifiable information:

```typescript
// lib/pii-mask.ts
/**
 * Masks sensitive information for logging
 */
export function maskPII(obj: Record<string, unknown>): Record<string, unknown> {
  const masked = { ...obj };

  const sensitiveFields = ['ssn', 'mrn', 'password', 'apiKey', 'token', 'secret'];

  sensitiveFields.forEach(field => {
    if (field in masked) {
      if (typeof masked[field] === 'string') {
        const str = masked[field] as string;
        masked[field] = str.length > 4
          ? '*'.repeat(str.length - 4) + str.slice(-4)
          : '****';
      }
    }
  });

  return masked;
}

// Usage
logger.info('User logged in', maskPII({ user: { id: '123', ssn: '123-45-6789' } }));
// Output: User logged in { user: { id: '123', ssn: '****5678' } }
```

### Content Security Policy (CSP)

Configure CSP headers to prevent injection attacks:

```typescript
// next.config.ts
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Minimize unsafe-* for production
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self'",
              "connect-src 'self' https://api.openai.com",
              "frame-ancestors 'self' chrome-extension://*",
              "form-action 'self'",
            ].join('; '),
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### CORS Configuration

Restrict CORS to trusted domains only:

```typescript
// lib/cors.ts
const TRUSTED_ORIGINS = [
  'https://entscribe.com',
  'https://app.entscribe.com',
  'chrome-extension://*', // Chrome extension
];

export function isTrustedOrigin(origin: string | null): boolean {
  if (!origin) return false;
  return TRUSTED_ORIGINS.some(trusted => {
    if (trusted.includes('*')) {
      const pattern = new RegExp(^${trusted.replace('*', '.*')}$);
      return pattern.test(origin);
    }
    return trusted === origin;
  });
}

// app/api/route.ts
import { isTrustedOrigin } from '@/lib/cors';

export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin');

  if (!isTrustedOrigin(origin)) {
    return NextResponse.json(
      { error: 'CORS policy violation' },
      { status: 403 }
    );
  }

  // Continue processing
}
```

### SQL Injection Prevention

Always use parameterized queries or ORM. Never concatenate SQL strings:

```typescript
// ❌ AVOID - SQL Injection vulnerability
const query = `SELECT * FROM patients WHERE mrn = '${patientMrn}'`;

// ✅ CORRECT - Parameterized query
import { db } from '@/lib/db';

const patient = await db.patients.findFirst({
  where: { mrn: patientMrn },
});

// Or with raw SQL
const patient = await db.$queryRaw`SELECT * FROM patients WHERE mrn = ${patientMrn}`;
```

### XSS Prevention

Always sanitize and escape user input, especially when rendering:

```typescript
// ❌ AVOID - XSS vulnerability
<div dangerouslySetInnerHTML={{ __html: userInput }} />

// ✅ CORRECT - Sanitized output
import DOMPurify from 'isomorphic-dompurify';

function UserContent({ html }: { html: string }) {
  const sanitized = DOMPurify.sanitize(html);
  return <div dangerouslySetInnerHTML={{ __html: sanitized }} />;
}

// ✅ Or just use text content
<div>{userInput}</div> // React escapes by default
```

---

## Testing Standards

### Unit Tests

Test individual functions and components in isolation:

```typescript
// components/__tests__/RecordButton.test.tsx
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import RecordButton from '../RecordButton';

describe('RecordButton', () => {
  it('should render record button', () => {
    const mockOnComplete = jest.fn();
    render(
      <RecordButton
        onTranscriptChunk={jest.fn()}
        onRecordingComplete={mockOnComplete}
      />
    );

    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('should call onRecordingComplete when recording stops', async () => {
    const mockOnComplete = jest.fn();
    const { rerender } = render(
      <RecordButton
        onTranscriptChunk={jest.fn()}
        onRecordingComplete={mockOnComplete}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalled();
    });
  });

  it('should handle microphone access errors gracefully', async () => {
    // Mock failed microphone access
    navigator.mediaDevices.getUserMedia = jest.fn(
      () => Promise.reject(new DOMException('Permission denied'))
    );

    const mockOnComplete = jest.fn();
    render(
      <RecordButton
        onTranscriptChunk={jest.fn()}
        onRecordingComplete={mockOnComplete}
      />
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    await waitFor(() => {
      expect(screen.getByText(/microphone/i)).toBeInTheDocument();
    });
  });
});
```

### Integration Tests

Test features that involve multiple components or systems:

```typescript
// tests/integration/transcription.integration.test.ts
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import NotePage from '@/app/note/page';

describe('Transcription Flow Integration', () => {
  it('should record audio and display transcript', async () => {
    // Mock the OpenAI API
    global.fetch = jest.fn((url: string) => {
      if (url.includes('/api/transcribe')) {
        return Promise.resolve(
          new Response(
            JSON.stringify({ success: true, data: { text: 'test transcript' } })
          )
        );
      }
      return Promise.reject(new Error('Unknown URL'));
    });

    render(<NotePage />);

    const recordButton = screen.getByRole('button', { name: /record/i });
    fireEvent.click(recordButton);

    await waitFor(() => {
      expect(screen.getByText(/test transcript/i)).toBeInTheDocument();
    });
  });
});
```

### E2E Tests (Playwright)

Test complete user workflows:

```typescript
// tests/e2e/recording.spec.ts
import { test, expect } from '@playwright/test';

test.describe('Audio Recording', () => {
  test('should record and transcribe audio', async ({ page }) => {
    await page.goto('/record');

    // Grant microphone permission
    await page.context().grantPermissions(['microphone']);

    const recordButton = page.locator('button:has-text("Record")');
    await recordButton.click();

    // Wait for recording indicator
    await expect(page.locator('text=Recording...')).toBeVisible();

    // Stop recording after 5 seconds
    await page.waitForTimeout(5000);
    await recordButton.click();

    // Wait for transcription to complete
    await expect(
      page.locator('[data-testid="transcript"]')
    ).toContainText(/your transcript here/i, { timeout: 10000 });
  });

  test('should handle missing microphone gracefully', async ({ page }) => {
    await page.context().grantPermissions([]);

    await page.goto('/record');
    const recordButton = page.locator('button:has-text("Record")');
    await recordButton.click();

    // Should show error message
    await expect(
      page.locator('text=Could not access microphone')
    ).toBeVisible();
  });
});
```

### Test File Organization

```
tests/
├── unit/
│   ├── utils/
│   │   └── formatDate.test.ts
│   ├── components/
│   │   └── RecordButton.test.tsx
│   └── lib/
│       └── validation.test.ts
├── integration/
│   ├── transcription.integration.test.ts
│   └── authentication.integration.test.ts
└── e2e/
    ├── recording.spec.ts
    ├── note-creation.spec.ts
    └── patient-search.spec.ts
```

### Naming Conventions for Tests

```typescript
describe('Component Name', () => {
  describe('method or feature', () => {
    it('should do something specific', () => {
      // Arrange
      const input = 'test';

      // Act
      const result = myFunction(input);

      // Assert
      expect(result).toBe('expected');
    });

    it('should handle edge case', () => {
      // Arrange, Act, Assert
    });
  });
});
```

---

## Git Conventions

### Commit Message Format

Follow conventional commits for clear, parseable commit history:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only
- `style`: Changes that don't affect code meaning (formatting, etc.)
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `perf`: Code change that improves performance
- `test`: Adding or updating tests
- `chore`: Changes to build process, dependencies, or tooling
- `security`: Security-related changes

**Examples:**

```
feat(audio): add streaming transcription support

Implement real-time transcription using Whisper streaming API.
Chunks are transcribed every 30 seconds and displayed incrementally.

Closes #42
```

```
fix(components): prevent re-record during transcription

Added isProcessing state to disable record button while transcription
is in progress, preventing user confusion.

Fixes #87
```

```
docs: update API route standards in CODING_STANDARDS.md

Added section on rate limiting and error response formats.
```

### Branch Naming

```
feature/audio-streaming           # New feature
feature/patient-search            # New feature

fix/transcription-timeout         # Bug fix
fix/microphone-permissions        # Bug fix

docs/api-documentation            # Documentation
chore/update-dependencies         # Maintenance
chore/eslint-config-update        # Maintenance

refactor/state-management         # Refactoring
perf/optimize-rendering           # Performance

test/add-unit-tests               # Testing
```

### PR Requirements

All PRs must include:

1. **Clear title** matching commit convention
2. **Description** explaining changes and rationale
3. **Testing** - describe what was tested
4. **Breaking changes** - clearly noted if any
5. **Screenshots** - for UI changes
6. **Security review** - for auth/data handling changes

**PR Template:**

```markdown
## Description
Brief description of what this PR does.

## Motivation and Context
Why is this change needed? What problem does it solve?

## Testing
How was this tested?
- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Screenshots (if UI changes)
[Add screenshots here]

## Security Considerations
Any security implications?

## Breaking Changes
Does this break existing functionality?

## Checklist
- [ ] Code follows CODING_STANDARDS.md
- [ ] TypeScript strict mode passes
- [ ] No console errors or warnings
- [ ] All tests pass
- [ ] Environment variables documented if added
```

---

## Performance

### Bundle Size Targets

- **Initial JS bundle:** < 300KB (gzipped)
- **Total app size:** < 500KB (gzipped)
- **Largest route:** < 150KB (gzipped)

Monitor with: `next/bundle-analyzer`

### Code Splitting & Lazy Loading

```typescript
// Lazy load components not needed on initial page load
'use client';

import dynamic from 'next/dynamic';

const HeavyComponent = dynamic(() => import('./HeavyComponent'), {
  loading: () => <p>Loading...</p>,
  ssr: false, // Don't render on server if not needed
});

export default function Page() {
  return (
    <div>
      <h1>Welcome</h1>
      <HeavyComponent />
    </div>
  );
}
```

### Image Optimization

Always use Next.js Image component:

```typescript
import Image from 'next/image';

// ❌ AVOID
<img src="/logo.png" alt="Logo" />

// ✅ CORRECT
<Image
  src="/logo.png"
  alt="Logo"
  width={200}
  height={100}
  priority={true} // For above-the-fold images
  sizes="(max-width: 768px) 100vw, 50vw"
/>
```

### React Performance

```typescript
// Use React.memo for expensive components
const PatientCard = React.memo(function PatientCard({ patient }: Props) {
  return <div>{patient.name}</div>;
});

// Use useCallback for props passed to memoized children
function ParentComponent() {
  const handleClick = useCallback((id: string) => {
    // Handle click
  }, []);

  return <PatientCard onDelete={handleClick} />;
}

// Use useMemo for expensive computations
function PatientStats({ patients }: { patients: Patient[] }) {
  const stats = useMemo(() => {
    return {
      totalPatients: patients.length,
      avgAge: patients.reduce((sum, p) => sum + p.age, 0) / patients.length,
    };
  }, [patients]);

  return <div>{stats.totalPatients} patients</div>;
}
```

### Database Query Optimization

```typescript
// ❌ AVOID - N+1 query problem
const notes = await db.note.findMany();
const enrichedNotes = await Promise.all(
  notes.map(note =>
    db.patient.findUnique({ where: { id: note.patientId } })
  )
);

// ✅ CORRECT - Single query with relations
const notes = await db.note.findMany({
  include: { patient: true },
});

// ✅ CORRECT - Pagination
const notes = await db.note.findMany({
  include: { patient: true },
  take: 20,
  skip: (page - 1) * 20,
  orderBy: { createdAt: 'desc' },
});
```

---

## Accessibility

### ARIA Attributes

Use semantic HTML and ARIA attributes appropriately:

```typescript
// ❌ AVOID - Non-semantic, missing ARIA
<div onClick={() => handleDelete(id)}>Delete</div>

// ✅ CORRECT - Semantic with ARIA
<button
  onClick={() => handleDelete(id)}
  aria-label="Delete note"
  type="button"
>
  Delete
</button>

// Complex widgets need ARIA roles
<div
  role="dialog"
  aria-labelledby="dialog-title"
  aria-modal="true"
>
  <h2 id="dialog-title">Confirm Delete</h2>
  <p>Are you sure?</p>
</div>
```

### Keyboard Navigation

Ensure all interactive elements are keyboard accessible:

```typescript
export default function RecordButton() {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    // spacebar or enter to activate
    if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      toggleRecording();
    }
  };

  return (
    <button
      onKeyDown={handleKeyDown}
      aria-pressed={isRecording}
      tabIndex={0}
    >
      {isRecording ? 'Stop' : 'Record'}
    </button>
  );
}
```

### Color Contrast

Ensure sufficient color contrast (WCAG AA minimum):
- **Normal text:** 4.5:1 ratio
- **Large text:** 3:1 ratio

Use tools: WebAIM Contrast Checker, aXe DevTools

### Form Labels

Always associate labels with form inputs:

```typescript
// ❌ AVOID
<input type="email" />

// ✅ CORRECT
<div>
  <label htmlFor="email-input">Email Address</label>
  <input id="email-input" type="email" />
</div>
```

### Screen Reader Testing

```typescript
// Provide meaningful alt text for images
<Image
  src="/chart.png"
  alt="Monthly patient volume chart showing 2500 visits in January"
/>

// Skip navigation links
<a href="#main-content" className="sr-only">
  Skip to main content
</a>

// Announcements for dynamic updates
<div role="status" aria-live="polite" aria-atomic="true">
  {transcriptionComplete && 'Transcription complete!'}
</div>
```

---

## Data Handling

### Patient Data Classification

```typescript
// lib/data-classification.ts

// Level 1: HIPAA Protected (Maximum security)
export const HIPAA_PROTECTED_FIELDS = new Set([
  'mrn',                    // Medical Record Number
  'ssn',                    // Social Security Number
  'dateOfBirth',           // In combination with other data
  'diagnoses',             // Medical diagnoses
  'medications',           // Current medications
  'insuranceId',           // Insurance identifiers
  'policyNumber',          // Policy numbers
]);

// Level 2: Sensitive (High security)
export const SENSITIVE_FIELDS = new Set([
  'email',
  'phone',
  'address',
  'firstName',
  'lastName',
]);

// Level 3: Internal (Standard security)
export const INTERNAL_FIELDS = new Set([
  'createdAt',
  'updatedAt',
  'id',
]);
```

### Encryption at Rest

```typescript
// lib/encryption.ts
import crypto from 'crypto';

const ENCRYPTION_KEY = process.env.DATA_ENCRYPTION_KEY!;

export function encryptData(plaintext: string): string {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-gcm', Buffer.from(ENCRYPTION_KEY), iv);

  let encrypted = cipher.update(plaintext, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();
  return iv.toString('hex') + ':' + authTag.toString('hex') + ':' + encrypted;
}

export function decryptData(ciphertext: string): string {
  const [iv, authTag, encrypted] = ciphertext.split(':');
  const decipher = crypto.createDecipheriv(
    'aes-256-gcm',
    Buffer.from(ENCRYPTION_KEY),
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
}

// Usage in API routes
export async function POST(req: NextRequest) {
  const { mrn, patientData } = await req.json();

  // Encrypt sensitive fields before storing
  const encryptedMrn = encryptData(mrn);
  const encryptedPatientData = encryptData(JSON.stringify(patientData));

  await db.patient.create({
    data: {
      mrn: encryptedMrn,
      data: encryptedPatientData,
    },
  });
}
```

### Encryption in Transit

```typescript
// next.config.ts - Force HTTPS
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/:path*',
        destination: 'https://entscribe.com/:path*',
        permanent: true,
        has: [{ type: 'header', key: 'x-forwarded-proto', value: 'http' }],
      },
    ];
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
```

### Data Minimization

Only collect and store data that is necessary:

```typescript
// ❌ AVOID - Collecting unnecessary data
const patient = {
  firstName: 'John',
  lastName: 'Doe',
  age: 45,
  gender: 'M',
  phoneNumber: '555-1234',
  email: 'john@example.com',
  address: '123 Main St',
  zip: '12345',
  // ... 20 more fields
};

// ✅ CORRECT - Minimal necessary data
const patient = {
  id: 'patient-123',
  mrn: 'encryptedMRN',
  name: 'John Doe',
  dateOfBirth: '1978-01-15',
};
```

### Data Retention & Deletion

```typescript
// lib/db/cleanup.ts
import { db } from '@/lib/db';
import { HIPAA_CONFIG } from '@/lib/hipaa';

/**
 * Delete patient data older than retention period
 * Run daily via cron job
 */
export async function deleteExpiredPatientData() {
  const retentionDate = new Date();
  retentionDate.setDate(
    retentionDate.getDate() - HIPAA_CONFIG.DATA_RETENTION_DAYS
  );

  const deleted = await db.patient.deleteMany({
    where: {
      AND: [
        { deletedAt: { lt: retentionDate } },
        { status: 'deleted' }, // Only soft-deleted records
      ],
    },
  });

  logger.info(`Deleted ${deleted.count} expired patient records`);
}

// Soft delete instead of hard delete (for audit trail)
export async function softDeletePatient(patientId: string, userId: string) {
  await db.patient.update({
    where: { id: patientId },
    data: {
      deletedAt: new Date(),
      deletedBy: userId,
    },
  });

  // Log deletion for audit trail
  await logAuditEvent('PATIENT_DELETED', {
    patientId,
    deletedBy: userId,
    timestamp: new Date(),
  });
}
```

---

## Logging & Monitoring

### Logging Configuration

```typescript
// lib/logger.ts
import pino from 'pino';

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = pino({
  level: process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info'),
  transport: isDevelopment
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

// Log levels
logger.debug('Detailed debugging info');
logger.info('General informational messages');
logger.warn('Warning messages - something unexpected');
logger.error('Error messages - something failed');
logger.fatal('Fatal errors - system must stop');
```

### What to Log

```typescript
// ✅ DO LOG
- Authentication events (login, logout, permission changes)
- API request/response times (performance monitoring)
- Data access operations (for audit trail)
- Errors and exceptions (with context)
- Security-related events (failed attempts, permission denied)
- Significant business events (note created, patient added)

// ❌ DON'T LOG
- Passwords or API keys
- Full SSNs or MRNs (use masked versions)
- Full email addresses (if sensitive)
- Large payloads
- Sensitive medical data
```

### Logging Examples

```typescript
// lib/logger.ts
import { logger } from '@/lib/logger';
import { maskPII } from '@/lib/pii-mask';

// Authentication event
logger.info('User login successful', {
  userId: user.id,
  email: maskPII({ email: user.email }).email,
  timestamp: new Date().toISOString(),
  ipAddress: getClientIP(req),
});

// API performance
const startTime = Date.now();
const response = await fetch('/api/transcribe', { body: formData });
const duration = Date.now() - startTime;

logger.debug('API request completed', {
  endpoint: '/api/transcribe',
  method: 'POST',
  statusCode: response.status,
  duration: `${duration}ms`,
  timestamp: new Date().toISOString(),
});

// Error with context
try {
  await processAudio(audioBlob);
} catch (error) {
  logger.error('Audio processing failed', {
    error: error instanceof Error ? error.message : String(error),
    audioSize: audioBlob.size,
    audioType: audioBlob.type,
    userId: user.id,
    timestamp: new Date().toISOString(),
  });
}

// Audit trail
logger.info('Patient data accessed', {
  action: 'VIEW_PATIENT',
  patientId: patientId,
  accessedBy: userId,
  timestamp: new Date().toISOString(),
  ipAddress: getClientIP(req),
});
```

### Error Tracking Integration

```typescript
// lib/error-tracking.ts
import * as Sentry from '@sentry/nextjs';

// Initialize in app
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1,
  beforeSend(event, hint) {
    // Don't send personally identifiable errors
    if (event.message?.includes('SSN') || event.message?.includes('MRN')) {
      return null;
    }
    return event;
  },
});

// Capture errors
export function reportError(error: Error, context?: Record<string, unknown>) {
  Sentry.captureException(error, {
    contexts: { app: context },
  });
}

// Usage
try {
  await transcribeAudio(blob);
} catch (error) {
  reportError(error, {
    audioSize: blob.size,
    audioType: blob.type,
  });
}
```

### Monitoring & Alerts

Monitor these key metrics:

```typescript
// Metrics to track
- API response times (p50, p95, p99)
- Error rates by endpoint
- Audio processing success rate
- Transcription accuracy
- User authentication success rate
- Database query performance
- Server CPU/memory usage
- Network latency
- Number of active users
```

---

## Documentation

### JSDoc Standards

```typescript
/**
 * Transcribes audio using OpenAI Whisper API
 *
 * @param audioBlob - Audio file to transcribe (webm, mp3, or wav)
 * @param language - ISO 639-1 language code (default: 'en')
 * @returns Promise<string> - Transcribed text
 *
 * @throws {ValidationError} If audioBlob is empty or invalid type
 * @throws {ApiError} If Whisper API request fails
 *
 * @example
 * ```typescript
 * const audioBlob = await recordAudio();
 * const transcript = await transcribeAudio(audioBlob, 'en');
 * console.log(transcript);
 * ```
 */
export async function transcribeAudio(
  audioBlob: Blob,
  language: string = 'en'
): Promise<string> {
  // implementation
}

/**
 * React component for recording and transcribing audio
 *
 * @param props - Component properties
 * @param props.onTranscriptChunk - Callback fired when a chunk is transcribed
 * @param props.onRecordingComplete - Callback fired when recording is finished
 * @param props.disabled - Whether the button is disabled (optional)
 * @param props.maxDurationSeconds - Maximum recording duration (optional, default: 3600)
 */
interface RecordButtonProps {
  onTranscriptChunk: (text: string) => void;
  onRecordingComplete: (fullTranscript: string) => void;
  disabled?: boolean;
  maxDurationSeconds?: number;
}
```

### Code Comments

Comment the "why", not the "what":

```typescript
// ❌ AVOID - Obvious comment
function calculateAge(birthDate: Date): number {
  const today = new Date(); // Get today's date
  const age = today.getFullYear() - birthDate.getFullYear(); // Calculate age
  return age;
}

// ✅ CORRECT - Explains reasoning
function calculateAge(birthDate: Date): number {
  // We use getFullYear() instead of calculating from milliseconds
  // because patients' ages are typically expressed in whole years
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();

  // Adjust if birthday hasn't occurred this year
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    return age - 1;
  }

  return age;
}
```

### README Requirements

Every module/feature should have a README explaining:

```markdown
# Feature Name

## Overview
Brief description of what this feature does.

## Installation
How to set it up.

## Usage
Code examples showing how to use.

## API
Public functions/components and their signatures.

## Testing
How to test this feature.

## Security Considerations
Any security implications or requirements.

## HIPAA Compliance
How this feature ensures HIPAA compliance (if applicable).

## Performance
Performance characteristics and optimization notes.
```

### Environment Variables Documentation

Always maintain `.env.example` with all required variables:

```env
# Authentication
AUTH_SECRET=your_secret_key_here
SESSION_TIMEOUT_MS=1800000

# OpenAI
OPENAI_API_KEY=sk-proj-your-key-here
OPENAI_MODEL=gpt-4o

# Database
DATABASE_URL=postgresql://user:password@host:port/db
DATABASE_ENCRYPTION_KEY=your_encryption_key

# Monitoring
SENTRY_DSN=https://key@sentry.io/project-id
LOG_LEVEL=info

# Security
CSRF_ENABLED=true
CORS_ORIGINS=https://entscribe.com,https://app.entscribe.com

# Features
ENABLE_STREAMING_TRANSCRIPTION=true
ENABLE_REAL_TIME_COLLABORATION=false
```

---

## Appendix: Quick Reference

### ESLint Configuration

```javascript
// eslint.config.mjs
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  js.configs.recommended,
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/explicit-function-return-types': 'warn',
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
];

export default eslintConfig;
```

### Pre-commit Hooks

```bash
# .husky/pre-commit
#!/bin/bash

# Run TypeScript check
npm run typecheck

# Run ESLint
npm run lint

# Run tests
npm run test:unit

# If any step fails, prevent commit
```

### Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run lint             # Run ESLint
npm run typecheck        # TypeScript type checking
npm run test             # Run all tests
npm run test:unit        # Unit tests only
npm run build            # Production build

# Code quality
npm run format           # Format with Prettier
npm run format:check     # Check formatting

# Commits
npm run commit           # Guided commit (commitizen)
```

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | Feb 2026 | Initial comprehensive standards guide for ENT Scribe v1 |

---

## Questions or Updates?

This document should be reviewed quarterly and updated as standards evolve. All team members should be familiar with these standards before contributing code to ENT Scribe.

**Last reviewed:** February 2026
