# ENT Scribe - Branch Strategy & Team Coordination

**Purpose:** Define how Claude Code (Frontend) and ChatGPT/Codex (Backend) work in parallel without blocking each other.

---

## 🌳 Git Branch Structure

```
main (stable, production-ready)
  ↑ (merge only after full QA)
  ├── claude/review-codebase-nh6L5-frontend
  │   └── Origin: Frontend development (Claude Code)
  │       Features: UI, components, state management
  │       MCP: Supabase client connection
  │       Deploy: None (waits for backend)
  │
  └── claude/review-codebase-nh6L5-backend
      └── Origin: Backend development (ChatGPT/Codex)
          Features: API routes, database, integrations
          MCP: Supabase server connection, API keys
          Deploy: To Vercel Edge Functions

integrate-branch (optional - for early integration testing)
  └── Both teams merge features here to test together before main
```

---

## 👥 Team Assignments

### Frontend Team (Claude Code)
**Lead:** Claude Code
**Branch:** `claude/review-codebase-nh6L5-frontend`
**Tools:** Next.js React components, Tailwind CSS, TypeScript
**Responsibilities:**
- All `.tsx` files in `/app` and `/components`
- Styling and THEME implementation
- Web Audio API recording interface
- React state management (Context, hooks)
- Client-side Deepgram TTS integration
- User interactions and forms

**Output:** Working UI components that call API endpoints (may mock initially)

---

### Backend Team (ChatGPT/Codex)
**Lead:** ChatGPT/Codex (or second Claude Code session)
**Branch:** `claude/review-codebase-nh6L5-backend`
**Tools:** Next.js API Routes, TypeScript, Supabase
**Responsibilities:**
- All `/api` routes
- Supabase database schema and RLS policies
- Deepgram transcription integration
- Claude Opus note generation
- Authentication logic
- Error handling and middleware
- Custom instructions storage
- Audit logging

**Output:** Working API endpoints with proper error handling

---

## 🔗 Integration Points (When Teams Connect)

| Checkpoint | Frontend Waits For | Backend Waits For | Integration Test |
|---|---|---|---|
| 0.1 | Project setup | Supabase DB ready | Both envs connect to Supabase |
| 1.1 | Auth UI mockup | Auth API routes | POST `/api/auth/signup` → works |
| 1.2 | Template selection UI | GET `/api/templates` route | Click template → loads from API |
| 1.3 | Recording UI + visualizer | POST `/api/transcribe` route | Record audio → see real-time transcript |
| 2.1 | Note display component | POST `/api/generate` route | Send transcript → get generated note |
| 2.2 | Note editor UI | PUT `/api/visits` route | Edit note → saves to DB |
| 3.1 | History page + search UI | GET `/api/visits` with filtering | Search patients → loads history |
| 4.1 | Chat UI component | POST `/api/scribe/chat` route | Send message → get scribe response |
| 4.3 | ICD codes display | POST `/api/icd-codes` route | Generate note → show ICD suggestions |

---

## 📝 Workflow Rules

### Rule 1: Don't Block Each Other
- **Frontend:** Can use mock API responses initially
  ```typescript
  // Use mock while backend builds
  const mockResponse = {
    transcript: "Patient reports ear pain...",
    note: "CC: Ear pain..."
  };
  ```
- **Backend:** Can return dummy data initially
  ```json
  { "status": "ok", "data": { "templates": [] } }
  ```

### Rule 2: Integrate Early & Often
- After each checkpoint completion, test the integration
- Frontend + Backend teams spend 15 min testing together
- If integration breaks, fix immediately (don't push broken code)

### Rule 3: API Contract First
- **Backend:** Define API response schema FIRST
  ```typescript
  // POST /api/generate
  interface GenerateNoteRequest {
    transcript: string;
    templateId: string;
    patientInfo?: { name?: string; dob?: string };
  }

  interface GenerateNoteResponse {
    success: boolean;
    note?: string;
    error?: string;
  }
  ```
- **Frontend:** Implement using that schema

### Rule 4: Environment Variables
**Backend `.env.local`:**
```
SUPABASE_URL=https://...
SUPABASE_SERVICE_KEY=sk-...
DEEPGRAM_API_KEY=...
ANTHROPIC_API_KEY=...
```

**Frontend `.env.local`:**
```
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

Never put secret keys in frontend `.env.local` (they'll be visible in browser)

### Rule 5: Supabase MCP Connection
Both teams use Supabase via MCP:
- **Frontend:** Uses Supabase JS client (read-only to user's data)
- **Backend:** Uses Supabase Admin API (full access)

```typescript
// Frontend - RLS enforced
import { createClient } from '@supabase/supabase-js'
const supabase = createClient(url, anonKey)

// Backend - Full access
const supabase = createClient(url, serviceKey)
```

---

## 🔄 Daily Standup (Quick Sync)

Once per day (or on-demand), teams sync:

**Checklist:**
- [ ] Frontend: What did I build? What's blocking me?
- [ ] Backend: What did I build? What's blocking me?
- [ ] Are we on schedule for checkpoint?
- [ ] Do we need to integrate today?
- [ ] Any API contract changes?

**Example:**
```
Frontend: "Built auth pages. Need backend auth routes to test."
Backend: "Auth routes done. Need frontend to test signup flow."
→ Integrate immediately
```

---

## 🐛 Conflict Resolution

**Scenario 1: API Changes**
- Backend needs to change response format
- Rule: Notify frontend ASAP
- Frontend updates immediately
- Both test integration

**Scenario 2: Database Schema Changes**
- Backend modifies database
- Frontend may need state changes
- Coordinate via schema comments in code

**Scenario 3: Merge Conflicts**
- Rare if you follow branch strategy
- If they happen: Resolve together (don't auto-merge)

---

## 🚀 Release Strategy

### Stage 1: Feature Branches
- Frontend commits to `claude/review-codebase-nh6L5-frontend`
- Backend commits to `claude/review-codebase-nh6L5-backend`
- Each runs Code Review + QA sub-agents (see docs/IMPLEMENTATION_ROADMAP.md)

### Stage 2: Integration Branch (Optional)
- After checkpoint, merge both into `integrate-branch`
- Run full E2E tests
- If all pass → merge to main

### Stage 3: Production Deploy
- Merge to `main`
- Deploy to Vercel
- Monitor errors in Sentry

---

## 📊 Progress Tracking

Use GitHub Projects or spreadsheet to track:

| Checkpoint | Frontend Status | Backend Status | Integration Test | Blocked By |
|---|---|---|---|---|
| 0.1 | ✅ Done | ✅ Done | ✅ Passed | - |
| 1.1 | 🔨 In Progress | 🔨 In Progress | ⏳ Pending | - |
| 1.2 | ⏳ Waiting | 🔨 In Progress | ⏳ Pending | Backend API |
| 1.3 | ✅ Done | ✅ Done | ✅ Passed | - |

---

## 🤖 Sub-Agent Workflow (Key for Success!)

After EVERY commit on BOTH branches:

### Code Review Agent (Runs on all commits)
**Checks:**
- ESLint/Prettier compliance
- Security (no hardcoded secrets)
- CODING_STANDARDS.md adherence
- API contract compliance (backend)
- Accessibility (frontend)

**Output:** Auto-fixes + commit if possible, or reports issues

### UI Testing Agent (Frontend only)
**Checks:**
- Screenshot all modified components
- Responsive design (mobile/tablet/desktop)
- Accessibility (WCAG AA)
- Theme.md compliance

**Output:** Screenshots saved to `/screenshots`

---

## ✅ Checkpoint Completion Criteria

A checkpoint is **DONE** when:
- [ ] All code is committed
- [ ] Code Review agent passed
- [ ] UI Testing agent passed (if frontend)
- [ ] Integration test passed
- [ ] No critical bugs remaining

Then → Move to next checkpoint

---

## 🎯 Example: How Checkpoint 1.1 Works

**Day 1 - Frontend Builds Auth UI**
```
Claude Code:
1. Create /app/auth/signup page
2. Create /app/auth/login page
3. Mock API calls (return fake data)
4. Commit to frontend branch
5. Code Review + UI Testing agents run
6. UI screenshots saved
```

**Day 1-2 - Backend Builds Auth API**
```
ChatGPT/Codex:
1. Create POST /api/auth/signup route
2. Create POST /api/auth/login route
3. Implement Supabase Auth
4. Commit to backend branch
5. Code Review agent runs
6. Test API with curl/Postman
```

**Day 2 - Integration**
```
Both:
1. Merge branches into integrate-branch
2. Frontend removes mock data, uses real API
3. Test signup → login → dashboard flow
4. If works → merge to main
5. If broken → fix & re-test
```

---

## 📞 Emergency Contact Protocol

If something is blocking progress:
1. Post in team chat immediately
2. Drop everything and pair-program
3. Resolve integration issue within 30 min
4. Continue checkpoint

Don't let blocking issues sit overnight.

---

## 🔐 Security Checklist Before Merging to Main

- [ ] No API keys in commits
- [ ] All environment variables in `.env.local` (not committed)
- [ ] Supabase RLS policies enforced
- [ ] No SQL injection vectors
- [ ] No XSS vulnerabilities
- [ ] Encryption of PII at rest
- [ ] HTTPS everywhere
- [ ] Error messages don't leak sensitive info
- [ ] Rate limiting enabled (API routes)
- [ ] CORS headers correct

---

**This strategy ensures both teams work in parallel without stepping on each other!**
