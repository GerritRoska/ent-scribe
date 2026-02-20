# ENT Scribe v1 - Implementation Roadmap (Master Build Plan)

**Version:** 1.0
**Status:** Ready for parallel team development
**Last Updated:** 2026-02-20

---

## 📋 Document Index (All interconnected)

| Document | Purpose | Audience | Status |
|----------|---------|----------|--------|
| [SOFTWARE_DESIGN_DOCUMENT.md](./SOFTWARE_DESIGN_DOCUMENT.md) | Architecture, DB schema, APIs, scope | Everyone | ✅ Complete |
| [THEME.md](#theme) | Design system, colors, typography, accessibility | Frontend team | 🔄 In Progress |
| [CODING_STANDARDS.md](#standards) | Hardcoded rules, patterns, security | Both teams | 🔄 In Progress |
| **[IMPLEMENTATION_ROADMAP.md](#)** | THIS FILE - Master build plan with checkpoints | Everyone | 🔨 Building |
| [FRONTEND_IMPLEMENTATION.md](#frontend) | Step-by-step frontend build | Frontend (Claude Code) | 📝 Draft Below |
| [BACKEND_IMPLEMENTATION.md](#backend) | Step-by-step backend build | Backend (ChatGPT/Codex) | 📝 Draft Below |
| [PHASE2_DESIGN_DOCUMENT.md](#phase2) | Phase 2 scope (EHR integrations, etc) | Planning | 🗓️ Next |

---

## 🏗️ High-Level Build Structure

```
v1 Implementation (6-8 weeks)
│
├─ FOUNDATION PHASE (Week 1)
│  ├─ Project setup & environments
│  ├─ Supabase setup (Auth + DB + MCP)
│  └─ Theme system + styling base
│
├─ CORE RECORDING PHASE (Week 2-3)
│  ├─ [Frontend] Auth pages (signup, login)
│  ├─ [Backend] Auth API routes
│  ├─ [Frontend] Home page + template selection
│  ├─ [Frontend] Recording UI + Web Audio API
│  └─ [Backend] Deepgram transcription routes
│
├─ NOTE GENERATION PHASE (Week 3-4)
│  ├─ [Backend] Claude Opus integration
│  ├─ [Frontend] Note display + editor
│  ├─ [Backend] Note generation routes
│  └─ [Backend] Custom instructions storage
│
├─ STORAGE & HISTORY PHASE (Week 4-5)
│  ├─ [Backend] Visit CRUD routes
│  ├─ [Frontend] History page + search/filter
│  ├─ [Backend] Audit logging setup
│  └─ [Frontend] Export/copy functionality
│
├─ ADVANCED FEATURES PHASE (Week 5-6)
│  ├─ [Frontend] Interactive scribe UI (conversation)
│  ├─ [Backend] Scribe agent routes (Claude conversation)
│  ├─ [Backend] Deepgram TTS for scribe voice
│  ├─ [Frontend] Hotkeys system
│  └─ [Backend] ICD code suggestion routes
│
├─ QA & POLISH PHASE (Week 6-7)
│  ├─ Performance optimization
│  ├─ Accessibility audit (WCAG AA)
│  ├─ Security review
│  └─ E2E testing
│
└─ LAUNCH PREP (Week 7-8)
   ├─ Deployment to Vercel
   ├─ Monitoring setup (Sentry)
   └─ Documentation finalization
```

---

## 🎯 Checkpoint System (CI/CD Gates)

**Every checkpoint includes:**
1. ✅ Feature build completion
2. 🤖 **Sub-Agent 1: Code Review**
   - Lint & formatting (ESLint, Prettier)
   - Security checks (no hardcoded keys, HIPAA rules)
   - Cross-reference against CODING_STANDARDS.md
   - Fix issues & commit
3. 🤖 **Sub-Agent 2: UI/Component Testing**
   - Take screenshots of new/modified components
   - Visual regression testing
   - Save screenshots to `/screenshots` folder
   - Document which components changed

---

## 📐 Team Split & Branch Strategy

### Frontend Branch: `claude/review-codebase-nh6L5-frontend`
**Lead:** Claude Code
**Tools:** Next.js, React, TypeScript, Tailwind

**Responsibilities:**
- All `.tsx` components (pages, components/)
- Styling & theme implementation
- Web Audio API recording interface
- State management (Context, hooks)
- Deepgram TTS integration (client-side)
- Interactive scribe UI

**Deliverables by checkpoint:**
1. Auth pages ✓
2. Home + template selection ✓
3. Recording UI ✓
4. Note editor ✓
5. History page ✓
6. Scribe conversation UI ✓
7. Hotkeys system ✓

---

### Backend Branch: `claude/review-codebase-nh6L5-backend`
**Lead:** ChatGPT/Codex (or second Claude Code session)
**Tools:** Next.js API Routes, TypeScript, Supabase

**Responsibilities:**
- All `/api` routes
- Supabase database schema & RLS
- Deepgram transcription integration
- Claude Opus note generation
- Authentication flows
- Custom instructions storage & retrieval
- Audit logging
- ICD code suggestions
- Error handling middleware

**Deliverables by checkpoint:**
1. Supabase setup ✓
2. Auth routes ✓
3. Deepgram transcription ✓
4. Claude integration ✓
5. Visit CRUD routes ✓
6. Scribe agent routes ✓
7. ICD code routes ✓

---

## 📊 Detailed Implementation Phases

### PHASE 0: Foundation (Week 1) - SEQUENTIAL

**Checkpoint 0.1: Project Setup & Environments**

**What:** Initialize all environments and configs

**Frontend Tasks (Claude Code):**
- [ ] Clone repo, create frontend branch
- [ ] `npm install` all dependencies
- [ ] Set up `.env.local` (Supabase keys, Deepgram key, Anthropic key)
- [ ] Configure TypeScript, ESLint, Prettier
- [ ] Set up Tailwind CSS with THEME.md colors
- [ ] Create folder structure: `/components`, `/app` pages
- [ ] Base layout with Sidebar navigation

**Backend Tasks (ChatGPT/Codex):**
- [ ] Create backend branch
- [ ] `npm install`
- [ ] Create Supabase project
- [ ] Set up `.env.local` (DB keys, API keys)
- [ ] Generate Supabase types (TypeScript)
- [ ] Create base API route structure
- [ ] Set up middleware for error handling

**QA Gates:**
- ✅ Code Review: Env vars properly hidden, no secrets in code
- ✅ UI Testing: N/A (no UI yet)

**Integration Point:** Both teams verify Supabase connection works from their environments

---

**Checkpoint 0.2: Supabase Database Schema**

**What:** Create all tables, RLS policies, and functions

**Backend Tasks:**
- [ ] Create `users` table (via Supabase Auth)
- [ ] Create `visits` table with all fields
- [ ] Create `templates` table (built-in + custom)
- [ ] Create `audit_logs` table
- [ ] Create `custom_instructions` table
- [ ] Create `icd_codes_cache` table (for caching suggestions)
- [ ] Set up RLS (Row Level Security) policies
- [ ] Create indexes for performance
- [ ] Create Supabase migrations folder

**SQL to implement:**
```sql
-- See SOFTWARE_DESIGN_DOCUMENT.md Section 4.2 for schema
```

**QA Gates:**
- ✅ Code Review: Schema follows best practices, RLS policies correct
- ✅ Testing: Manual verification that tables exist, RLS works

**Frontend:** Can now design state based on schema

---

**Checkpoint 0.3: Theme System Implementation**

**What:** Integrate design system from THEME.md

**Frontend Tasks:**
- [ ] Update `tailwind.config.ts` with THEME colors/spacing
- [ ] Create color variables in CSS
- [ ] Implement typography (fonts, sizes)
- [ ] Create reusable component styles (buttons, inputs, modals)
- [ ] Set up dark mode toggle (if applicable)
- [ ] Add accessibility utility classes

**QA Gates:**
- ✅ Code Review: Theme colors match THEME.md, accessibility classes present
- ✅ UI Testing: Take screenshots of color palette page, typography samples

---

### PHASE 1: Core Recording (Week 2-3)

**Checkpoint 1.1: Authentication System**

**Frontend Tasks:**
- [ ] Create `/app/auth/signup` page
- [ ] Create `/app/auth/login` page
- [ ] Create `/app/auth/reset-password` page
- [ ] Signup form with validation
- [ ] Login form with validation
- [ ] Google OAuth button integration
- [ ] Store auth state in React Context
- [ ] Protected route wrapper component
- [ ] Logout button in Sidebar

**Backend Tasks:**
- [ ] Create `POST /api/auth/signup` route
- [ ] Create `POST /api/auth/login` route
- [ ] Create `POST /api/auth/logout` route
- [ ] Create `POST /api/auth/refresh` route
- [ ] Create `POST /api/auth/reset-password` route
- [ ] Set up Supabase Auth integration
- [ ] Implement Google OAuth config
- [ ] Add error handling + rate limiting
- [ ] Create middleware to verify JWT tokens
- [ ] Encrypt PII in user records

**QA Gates:**
- ✅ Code Review: Password hashing correct, no secrets exposed, JWT valid
- ✅ UI Testing: Screenshot signup/login pages, test Google OAuth button

**Integration Point:** Test full auth flow (signup → dashboard → logout)

---

**Checkpoint 1.2: Home Page & Template Selection**

**Frontend Tasks:**
- [ ] Create `/app/page.tsx` (home/dashboard)
- [ ] Display list of 5 built-in ENT templates
- [ ] Display user's custom templates (from DB)
- [ ] Template cards showing description + button
- [ ] "Create Custom Template" button → `/templates` page
- [ ] Patient demographics form (name, DOB, MRN)
- [ ] "Start Recording" button → navigate to `/record`

**Backend Tasks:**
- [ ] Create `GET /api/templates` route (return built-in + user's custom)
- [ ] Create `POST /api/templates` route (create custom)
- [ ] Create `PUT /api/templates/[id]` route
- [ ] Create `DELETE /api/templates/[id]` route
- [ ] Store default ENT templates in database or config

**QA Gates:**
- ✅ Code Review: Template data structure correct, API follows REST pattern
- ✅ UI Testing: Screenshot home page, template cards, form fields

---

**Checkpoint 1.3: Recording Interface & Web Audio API**

**Frontend Tasks:**
- [ ] Create `/app/record/page.tsx`
- [ ] Implement `RecordButton.tsx` component:
  - [ ] Start/pause/resume/stop recording
  - [ ] Real-time transcription display
  - [ ] Recording timer
  - [ ] Visualizer (audio levels)
  - [ ] Waveform display
- [ ] Implement `TranscriptView.tsx` component
- [ ] Add patient demographics display
- [ ] Media Permission request handling
- [ ] Error handling (no microphone, etc)
- [ ] Stop recording → auto-navigate to note generation

**Backend Tasks:**
- [ ] Create `POST /api/transcribe` route (Deepgram integration)
- [ ] Implement streaming response for real-time transcription
- [ ] Store audio chunks temporarily (in memory or Supabase Storage)
- [ ] Delete audio chunks after transcription
- [ ] Handle Deepgram API errors gracefully
- [ ] Add timeout handling for long recordings

**QA Gates:**
- ✅ Code Review: Web Audio API correct, Deepgram API key secure, error handling complete
- ✅ UI Testing: Screenshot recording page, test pause button, visualizer

**Integration Point:** Record test audio → verify transcription appears real-time

---

### PHASE 2: Note Generation (Week 3-4)

**Checkpoint 2.1: Claude Integration & Note Generation**

**Backend Tasks:**
- [ ] Set up Anthropic SDK (Claude Opus API)
- [ ] Create `POST /api/generate` route
- [ ] Implement prompt engineering for medical notes:
  - [ ] System prompt (clinical accuracy, no hallucination)
  - [ ] User prompt (transcript + template)
  - [ ] Add custom instructions to prompt
- [ ] Handle streaming responses
- [ ] Error handling for Claude API failures
- [ ] Rate limiting per user
- [ ] Add caching for identical requests
- [ ] Implement retry logic

**Frontend Tasks:**
- [ ] Send transcript + selected template to `/api/generate`
- [ ] Show loading spinner while generating
- [ ] Display generated note when ready
- [ ] Error handling (show error message if generation fails)

**QA Gates:**
- ✅ Code Review: Prompt is secure, no prompt injection, API key hidden
- ✅ Testing: Generate 5 test notes, verify medical accuracy

---

**Checkpoint 2.2: Note Editor Component**

**Frontend Tasks:**
- [ ] Create `NoteEditor.tsx` component
- [ ] Rich text editor with formatting (bold, italic, lists)
- [ ] Save changes locally first
- [ ] Undo/redo functionality
- [ ] Template sections editable
- [ ] Spellcheck integration
- [ ] Character count
- [ ] Copy-to-clipboard button
- [ ] Edit history (track changes)

**Backend Tasks:**
- [ ] Create `PUT /api/visits/[id]` route (update edited note)
- [ ] Create `POST /api/visits` route (save new visit with note)
- [ ] Validate visit data before saving
- [ ] Handle concurrent edits

**QA Gates:**
- ✅ Code Review: Copy-to-clipboard secure, XSS prevention in editor
- ✅ UI Testing: Screenshot note editor, test all buttons

---

**Checkpoint 2.3: Custom Instructions System**

**Frontend Tasks:**
- [ ] Create `/app/settings` page
- [ ] "Custom Instructions" section
- [ ] Text area for user preferences
- [ ] Example instructions display
- [ ] Save button
- [ ] Load user's previous instructions

**Backend Tasks:**
- [ ] Create `custom_instructions` table
- [ ] Create `GET /api/instructions` route
- [ ] Create `PUT /api/instructions` route
- [ ] Store instructions in encrypted format
- [ ] Include instructions in Claude prompt

**Example Instructions:**
```
"I prefer no em dashes, use hyphens instead
I like short summaries (1 paragraph max)
Always include ICD codes at the end
Use bullet points for lists, not numbers
Never include patient phone numbers"
```

**QA Gates:**
- ✅ Code Review: Instructions properly encrypted, safely passed to Claude
- ✅ Testing: Generate note with/without instructions, verify changes

---

### PHASE 3: Storage & History (Week 4-5)

**Checkpoint 3.1: Visit CRUD & History Page**

**Frontend Tasks:**
- [ ] Create `/app/history/page.tsx`
- [ ] Display list of all past visits
- [ ] Search by patient name, date range
- [ ] Filter by template type
- [ ] Sort by date (newest first)
- [ ] Click visit → view/edit note
- [ ] Delete button → soft delete (90-day retention)
- [ ] Pagination (20 per page)
- [ ] Loading states

**Backend Tasks:**
- [ ] Create `GET /api/visits` (list with search/filter/sort)
- [ ] Create `GET /api/visits/[id]` (get single visit)
- [ ] Create `PUT /api/visits/[id]` (update visit)
- [ ] Create `DELETE /api/visits/[id]` (soft delete)
- [ ] Implement search using PostgreSQL full-text search
- [ ] Add pagination logic
- [ ] Implement 90-day retention cleanup job

**QA Gates:**
- ✅ Code Review: Search SQL safe (no injection), pagination correct
- ✅ UI Testing: Screenshot history page, test search, filter, pagination

---

**Checkpoint 3.2: Audit Logging**

**Backend Tasks:**
- [ ] Create audit_logs table (if not done)
- [ ] Create logging middleware
- [ ] Log all user actions:
  - [ ] Login/logout
  - [ ] Create/edit/delete visit
  - [ ] Create/edit/delete template
  - [ ] Update instructions
  - [ ] Export note
- [ ] Include user_id, action, timestamp, IP address
- [ ] Prevent audit log tampering (read-only after creation)
- [ ] Query audit logs (for compliance)

**Frontend:** N/A

**QA Gates:**
- ✅ Code Review: All sensitive actions logged, HIPAA compliance

---

### PHASE 4: Advanced Features (Week 5-6)

**Checkpoint 4.1: Interactive Scribe Agent**

**Frontend Tasks:**
- [ ] Create `/app/record/scribe-chat` component
- [ ] Chat interface (message bubbles)
- [ ] Send message to scribe AI
- [ ] Display scribe responses
- [ ] Real-time conversation during/after recording
- [ ] Scribe voice toggle (on/off for TTS)
- [ ] Insert scribe suggestions into note

**Backend Tasks:**
- [ ] Create `POST /api/scribe/chat` route
- [ ] Implement Claude conversation loop:
  - [ ] Maintain conversation history
  - [ ] Context: transcript + template + patient info
  - [ ] Scribe asks clarifying questions
  - [ ] Doctor gives instructions ("add this to MDM")
  - [ ] Scribe updates note in real-time
- [ ] Create `POST /api/scribe/voice` (Deepgram TTS)
- [ ] Stream scribe responses as audio
- [ ] Handle conversation state in DB

**Example Scribe Interactions:**
```
Doctor: "Patient has migraines"
Scribe: "Got it. How long have they had them?"
Doctor: "A few months"
Scribe: "OK, adding to HPI. Any triggers you discussed?"
Doctor: "Yeah, stress and caffeine"
Scribe: "Adding to scribe. Assessment: Migraine without aura. Should I note the coffee intake?"
```

**QA Gates:**
- ✅ Code Review: Conversation context secure, Deepgram TTS key hidden
- ✅ UI Testing: Screenshot chat UI, test voice playback

---

**Checkpoint 4.2: Hotkeys/Voice Commands**

**Frontend Tasks:**
- [ ] Create hotkeys system:
  - [ ] Define custom hotkeys (Ctrl+1, Ctrl+2, etc)
  - [ ] Store in localStorage
  - [ ] Display hotkey legend
- [ ] Pre-defined hotkeys:
  - [ ] Ctrl+P = Pause/resume recording
  - [ ] Ctrl+G = Generate note
  - [ ] Ctrl+S = Save note
  - [ ] Ctrl+C = Copy to clipboard
- [ ] Voice command system:
  - [ ] Listen for keywords
  - [ ] "Hey scribe, pause"
  - [ ] "Hey scribe, save"
  - [ ] "Hey scribe, add to MDM"

**Backend Tasks:**
- [ ] Create voice command recognition (using Web Speech API)
- [ ] Create `/api/voice-commands` route (log commands)
- [ ] Create hotkey templates storage

**QA Gates:**
- ✅ Code Review: Hotkeys don't conflict with OS shortcuts
- ✅ Testing: Test 5 different hotkeys

---

**Checkpoint 4.3: ICD Code Suggestions**

**Frontend Tasks:**
- [ ] Display suggested ICD codes in note editor
- [ ] Click code → insert into note
- [ ] Hide/show code suggestions

**Backend Tasks:**
- [ ] Create `POST /api/icd-codes` route
- [ ] Implement Claude prompt:
  - [ ] Input: generated medical note
  - [ ] Output: List of relevant ICD codes with descriptions
- [ ] Cache common codes to reduce API calls
- [ ] Validate codes against ICD-10 database

**Example:**
```
Note: "Patient with acute sinusitis, fever 101F"
Suggested codes:
- J01.00: Acute maxillary sinusitis without abscess
- R50.9: Fever, unspecified
- A00-B99: Includes if infectious cause
```

**QA Gates:**
- ✅ Code Review: ICD codes valid, caching correct
- ✅ Testing: Generate codes for 3 different note types

---

### PHASE 5: QA & Polish (Week 6-7)

**Checkpoint 5.1: Performance Optimization**

**Both Teams:**
- [ ] Run Lighthouse audit
- [ ] Bundle size analysis (target: < 200KB gzipped)
- [ ] Lazy load components
- [ ] Optimize images
- [ ] Implement caching strategies
- [ ] Database query optimization
- [ ] Remove unused dependencies

**QA Gates:**
- ✅ Lighthouse score > 85
- ✅ Bundle size < 200KB

---

**Checkpoint 5.2: Accessibility Audit (WCAG AA)**

**Frontend Tasks:**
- [ ] Run axe accessibility scanner
- [ ] Keyboard navigation test
- [ ] Screen reader testing
- [ ] Color contrast check
- [ ] Focus indicators visible
- [ ] ARIA labels complete
- [ ] Form labels accessible

**QA Gates:**
- ✅ 0 critical accessibility issues
- ✅ Manual keyboard navigation test passed

---

**Checkpoint 5.3: Security Review**

**Both Teams:**
- [ ] OWASP Top 10 check
- [ ] No hardcoded secrets
- [ ] HTTPS everywhere
- [ ] CSP headers correct
- [ ] SQL injection prevention
- [ ] XSS prevention
- [ ] CSRF token implementation
- [ ] Rate limiting enabled

**QA Gates:**
- ✅ Security audit passed
- ✅ Penetration testing (if applicable)

---

### PHASE 6: Launch Prep (Week 7-8)

**Checkpoint 6.1: Deployment & Monitoring**

**Backend Tasks:**
- [ ] Deploy to Vercel
- [ ] Set environment variables in Vercel
- [ ] Configure Supabase prod database
- [ ] Set up monitoring (Sentry)
- [ ] Configure error tracking
- [ ] Set up analytics (Mixpanel optional)
- [ ] DNS setup (if custom domain)

**Frontend Tasks:**
- [ ] Test production build locally
- [ ] Verify all API endpoints work
- [ ] Test authentication flow end-to-end
- [ ] Verify Deepgram, Claude APIs work in prod
- [ ] Test on multiple devices/browsers

**QA Gates:**
- ✅ App works in production
- ✅ All external APIs connected
- ✅ Errors logged to Sentry

---

**Checkpoint 6.2: Documentation Finalization**

- [ ] User guide (how to use app)
- [ ] Admin guide (settings, data management)
- [ ] FAQ document
- [ ] Troubleshooting guide
- [ ] API documentation (for future integrations)
- [ ] Database documentation

---

## 🤖 Sub-Agent Workflow (Every Checkpoint)

After EVERY feature build and commit, trigger:

### Sub-Agent 1: Code Review
```bash
Trigger: On every git commit
Task:
  1. Lint code (ESLint)
  2. Check formatting (Prettier)
  3. Security scan (check for secrets, HIPAA violations)
  4. Cross-reference CODING_STANDARDS.md
  5. Review against PHASE checklist
  6. If issues found: fix code, create new commit
  7. Report: "✅ Passed" or "❌ Fixed X issues, see commit Y"
```

### Sub-Agent 2: UI/Component Testing
```bash
Trigger: On frontend commits only
Task:
  1. Run component story tests (Storybook)
  2. Take screenshots of modified components
  3. Compare against THEME.md design
  4. Check responsive design (mobile/tablet/desktop)
  5. Accessibility check (WCAG AA)
  6. Save screenshots to /screenshots/[component]-[date].png
  7. Report: "✅ All components pass" or "❌ X issues, see /screenshots"
```

---

## 📱 Integration Points (Frontend ↔ Backend)

| Checkpoint | Frontend Needs | Backend Provides | Test |
|---|---|---|---|
| 1.1 | Auth pages | Auth routes | Signup → Login → Home |
| 1.2 | Template selection | GET /api/templates | Load templates on home |
| 1.3 | Recording UI | POST /api/transcribe | Record audio → see transcript |
| 2.1 | Note display | POST /api/generate | Transcript → Note generation |
| 2.2 | Note editor | PUT /api/visits | Edit → Save to DB |
| 3.1 | History page | GET /api/visits | View past visits |
| 4.1 | Chat UI | POST /api/scribe/chat | Send message → get response |
| 4.2 | Hotkeys UI | /api/voice-commands | Test hotkey execution |
| 4.3 | Code suggestions | POST /api/icd-codes | Show suggested codes |

---

## 📊 Success Metrics per Phase

| Phase | KPIs | Target |
|-------|------|--------|
| 0 | Zero config errors, all envs working | 100% |
| 1 | Auth flow end-to-end works, recording starts | 100% |
| 2 | Note generation works, editing saves | 100% |
| 3 | History searchable, visits persist | 100% |
| 4 | Scribe responds, hotkeys work | 100% |
| 5 | Lighthouse > 85, 0 A11y issues | 100% |
| 6 | App deployed, all APIs live | 100% |

---

## 🚫 What NOT to Do

- ❌ Frontend waits for all backend before starting
- ❌ Backend waits for frontend design before API
- ❌ Commit without running Code Review agent
- ❌ Push to main without passing QA gates
- ❌ Use hardcoded API keys or secrets
- ❌ Skip accessibility testing (WCAG AA required)
- ❌ Ignore CODING_STANDARDS.md
- ❌ Forget to run UI screenshots on component changes

---

## ✅ Handoff to Development Teams

**For Claude Code (Frontend):**
1. Read: SOFTWARE_DESIGN_DOCUMENT.md (architecture overview)
2. Read: THEME.md (design system)
3. Read: CODING_STANDARDS.md (best practices)
4. Follow: IMPLEMENTATION_ROADMAP.md (Checkpoints 0.1 → 4.3)
5. On every commit: trigger Code Review + UI Testing agents

**For ChatGPT/Codex (Backend):**
1. Read: SOFTWARE_DESIGN_DOCUMENT.md (schema, APIs)
2. Read: CODING_STANDARDS.md (best practices)
3. Read: PHASE2_DESIGN_DOCUMENT.md (future EHR integration)
4. Follow: IMPLEMENTATION_ROADMAP.md (Checkpoints 0.1 → 4.3)
5. On every commit: trigger Code Review agent

**For QA/Testing:**
1. Follow checkpoint completion criteria
2. Run sub-agents after every feature
3. Track progress in spreadsheet or GitHub Projects

---

## 🔄 Phase 2 (After v1 Launch)

See [PHASE2_DESIGN_DOCUMENT.md](./PHASE2_DESIGN_DOCUMENT.md) (to be created)

Topics:
- EHR API integrations (Epic, eClinicalWorks, Cerner)
- FHIR/HL7 compliance
- Public template marketplace
- Advanced analytics dashboard
- Multi-org/multi-user accounts
- Premium features

---

**Next Step:** Approve this roadmap, then Claude Code starts Checkpoint 0.1 on frontend branch while ChatGPT/Codex starts Checkpoint 0.1 on backend branch in parallel.
