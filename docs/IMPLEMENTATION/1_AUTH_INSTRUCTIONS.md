# 1. Authentication (AUTH) - Implementation Instructions

**Component:** User signup, login, Google OAuth, password reset
**Owner:** [Assign developer]
**Status:** NOT STARTED
**Estimated Time:** 3-4 days
**Dependencies:** Supabase project setup, environment variables

---
> After completing this module, update `docs/IMPLEMENTATION_ROADMAP.md` and `docs/STATUS.md`.

## Objective

Implement secure user authentication via:
1. Email/password signup & login
2. Google OAuth integration
3. Password reset flow
4. Session management
5. HIPAA-ready user profiles with encrypted names

---

## Requirements

### Functional Requirements

#### 1.1 Email/Password Authentication
```
✅ Sign up with email + password
✅ Email verification (optional: for v1, confirm email exists)
✅ Log in with email + password
✅ Password validation rules:
   - Min 8 characters
   - At least 1 uppercase, 1 lowercase, 1 number
   - Special character recommended
✅ Redirect to home after login
✅ Remember user session (7 days)
✅ Log out
```

#### 1.2 Google OAuth
```
✅ "Sign up with Google" button
✅ OAuth redirect to Google
✅ Create Supabase user on first login
✅ Auto-fill email from Google
✅ Link Google account to existing email account (optional)
```

#### 1.3 Password Reset
```
✅ "Forgot password" link on login
✅ Enter email → send reset link
✅ Reset link valid for 1 hour
✅ Set new password
✅ Email confirmation of reset
```

#### 1.4 User Profile
```
✅ Store user's full name (encrypted)
✅ Store email (not encrypted, needed for login)
✅ Store created_at, last_login timestamps
✅ User settings (preferences, custom instructions)
✅ Doctor profile (ENT specialty info - optional v1)
```

---

## Technical Implementation

### 1. Supabase Setup

#### Step 1.1: Create Supabase Project
```bash
# If not already created:
npm install @supabase/supabase-js
```

Create `.env.local`:
```env
# Supabase (from project settings)
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key> # Only for API routes

# OAuth (from Google Cloud Console)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<google-client-id>
GOOGLE_CLIENT_SECRET=<google-client-secret> # Only server-side
```

#### Step 1.2: Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `https://<your-domain>/auth/callback`
4. Add localhost redirect: `http://localhost:3000/auth/callback`

#### Step 1.3: Configure Supabase Auth
1. Supabase dashboard → Authentication → Settings
2. Add OAuth provider: Google
3. Paste Client ID and Secret
4. Enable "Email confirmation" (if desired)

---

### 2. Database Schema

#### Users Table (managed by Supabase Auth)
```sql
-- Supabase automatically creates auth.users table
-- Additional user profile table:
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email VARCHAR UNIQUE NOT NULL,
  full_name_encrypted BYTEA, -- encrypted name for HIPAA compliance
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE,
  preferences JSONB DEFAULT '{}',
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- RLS policy: users can only see their own record
CREATE POLICY "users_select_self" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "users_update_self" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "users_insert_own" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Doctor Profile (Optional for v1)
```sql
CREATE TABLE doctor_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  specialty VARCHAR DEFAULT 'ENT',
  license_number_encrypted BYTEA,
  npi_number_encrypted BYTEA,
  practice_name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

---

### 3. Frontend Implementation

#### Step 3.1: Create Auth Context
`lib/auth/auth-context.tsx`:
```typescript
import { createContext, useContext, ReactNode } from 'react'
import { Session } from '@supabase/auth-helpers-nextjs'

type AuthContextType = {
  session: Session | null
  user: any // User object from Supabase
  loading: boolean
  signUp: (email: string, password: string, fullName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  // Implementation (see code example below)
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
```

#### Step 3.2: Supabase Client Helper
`lib/auth/supabase-client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// PII Encryption helper
import { box, randomBytes } from 'tweetnacl'
import { encodeBase64, decodeBase64 } from 'tweetnacl-util'

export function encryptPII(plaintext: string, publicKey: Uint8Array): string {
  const ephemeralKeypair = box.keyPair()
  const nonce = randomBytes(box.nonceLength)
  const encrypted = box(
    Buffer.from(plaintext),
    nonce,
    publicKey,
    ephemeralKeypair.secretKey
  )
  return encodeBase64(
    ephemeralKeypair.publicKey + nonce + encrypted
  )
}

export function decryptPII(ciphertext: string, secretKey: Uint8Array): string {
  // Implementation...
}
```

#### Step 3.3: Auth Pages

**app/auth/signup/page.tsx**
```typescript
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth/auth-context'

export default function SignUpPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { signUp } = useAuth()

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      await signUp(email, password, fullName)
      router.push('/') // Redirect to home
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-3xl font-bold mb-6 text-center">ENT Scribe</h1>

        <form onSubmit={handleSignUp} className="space-y-4">
          <input
            type="text"
            placeholder="Full Name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
          <input
            type="password"
            placeholder="Password (min 8 chars)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />

          {error && <p className="text-red-600 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>
        </form>

        <div className="my-6 flex items-center">
          <div className="flex-1 border-t"></div>
          <span className="px-3 text-gray-500">OR</span>
          <div className="flex-1 border-t"></div>
        </div>

        <GoogleOAuthButton />

        <p className="text-center mt-4 text-sm">
          Already have an account?{' '}
          <a href="/auth/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  )
}
```

**components/auth/GoogleOAuthButton.tsx**
```typescript
'use client'
import { useEffect } from 'react'
import { createClient } from '@/lib/auth/supabase-client'

export default function GoogleOAuthButton() {
  const handleGoogleSignIn = async () => {
    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
      },
    })
    if (error) console.error('OAuth error:', error)
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      className="w-full flex items-center justify-center gap-2 border border-gray-300 rounded-lg py-2 hover:bg-gray-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google icon SVG */}
      </svg>
      Sign up with Google
    </button>
  )
}
```

---

### 4. API Routes

#### app/api/auth/signup/route.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  const { email, password, fullName } = await request.json()

  if (!email || !password || !fullName) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    )
  }

  // Validate password strength
  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters' },
      { status: 400 }
    )
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  try {
    // Create auth user
    const { data: { user }, error: signUpError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm for v1
    })

    if (signUpError) throw signUpError

    // Create user profile (with encrypted name)
    const encryptedName = encryptPII(fullName, publicKey) // TODO: implement
    await supabase.from('users').insert({
      id: user!.id,
      email,
      full_name_encrypted: encryptedName,
    })

    return NextResponse.json({ success: true, user })
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Sign up failed' },
      { status: 500 }
    )
  }
}
```

#### app/api/auth/callback/route.ts
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const code = searchParams.get('code')

  if (!code) {
    return NextResponse.redirect(new URL('/auth/login', request.url))
  }

  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
    }
  )

  // Exchange code for session
  const { error } = await supabase.auth.exchangeCodeForSession(code)

  if (error) {
    return NextResponse.redirect(new URL('/auth/login?error=auth_failed', request.url))
  }

  return NextResponse.redirect(new URL('/', request.url))
}
```

---

### 5. Testing

#### __tests__/auth.test.ts
```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { createClient } from '@/lib/auth/supabase-client'

describe('Authentication', () => {
  let supabase: any

  beforeEach(() => {
    supabase = createClient()
  })

  it('should sign up with email and password', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'Test123!@#',
    })

    expect(error).toBeNull()
    expect(data.user).toBeDefined()
    expect(data.user?.email).toBe('test@example.com')
  })

  it('should reject weak passwords', async () => {
    const { error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'weak',
    })

    expect(error).toBeDefined()
  })

  it('should log in with valid credentials', async () => {
    // Setup: create user
    await supabase.auth.signUp({
      email: 'login-test@example.com',
      password: 'Test123!@#',
    })

    // Test: login
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'login-test@example.com',
      password: 'Test123!@#',
    })

    expect(error).toBeNull()
    expect(data.session).toBeDefined()
  })
})
```

---

## Checklist

- [ ] Supabase project created
- [ ] Google OAuth configured
- [ ] Environment variables set
- [ ] Database schema created
- [ ] Auth context implemented
- [ ] Supabase client configured
- [ ] Sign up page implemented
- [ ] Login page implemented
- [ ] Password reset flow implemented
- [ ] Google OAuth button functional
- [ ] Session management working
- [ ] API routes tested
- [ ] Unit tests passing
- [ ] WCAG AA accessibility verified
- [ ] Error messages user-friendly
- [ ] Committed to `claude/review-codebase-nh6L5`

---

## Related Documentation

- [SOFTWARE_DESIGN_DOCUMENT.md](../SOFTWARE_DESIGN_DOCUMENT.md) - Architecture overview
- [CODING_STANDARDS.md](../CODING_STANDARDS.md) - Code quality standards
- [THEME.md](../THEME.md) - Design system

---

**Status:** Ready to implement. Start with Step 1.1 (Supabase Setup).
