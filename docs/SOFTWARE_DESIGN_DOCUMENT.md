# ENT Scribe v1 - Software Design Document

**Project:** ENT Scribe (Medical AI Scribe for ENT Physicians)
**Version:** 1.0
**Status:** [IN DEVELOPMENT - SCOPE REFINEMENT]
**Last Updated:** 2026-02-20

---

## 1. Executive Summary

ENT Scribe v1 is a **web-first, mobile-optimized** ambient AI medical scribe application that enables ENT physicians to:
- Record patient visits in natural speech
- Generate structured clinical notes in real-time
- Save/access notes across devices via cloud storage (Supabase)
- Copy and paste notes directly into EHRs
- Future-ready for direct EHR API integrations

**Target Launch:** Single cohesive, lovable product with perfect core experience.

---

## 2. Scope Definition (DRAFT - TO BE REFINED)

### 2.1 In-Scope for v1 ✅ FINALIZED
- [x] Web app (Next.js 16, TypeScript, Tailwind) - mobile-first responsive
- [x] User authentication (Email + Google OAuth via Supabase Auth)
- [x] Cloud storage (Supabase PostgreSQL) for visits, notes, templates
- [x] Real-time audio recording (Web Audio API) with pause/resume
- [x] **Unlimited recording duration** per visit
- [x] Transcription via **Deepgram** (real-time streaming)
- [x] Note generation via **Claude Opus 4.6** (best-in-class medical reasoning)
- [x] 5 built-in ENT templates
- [x] **Unlimited custom template creation**
- [x] Copy-to-clipboard (for EHR pasting)
- [x] Visit history with search/filter
- [x] Note editing + **auto-save to cloud**
- [x] Delete audio after transcription (keep transcript only)
- [x] Error handling & user feedback
- [x] **HIPAA-ready** (encrypted PII at rest)
- [x] **Audit logging** for compliance
- [x] Accessibility (WCAG AA)

### 2.2 Out-of-Scope for v1
- [ ] Direct EHR API integrations (Phase 2 - architected for FHIR/HL7)
- [ ] Public template marketplace (Phase 2)
- [ ] Advanced analytics/dashboards
- [ ] Mobile native apps (iOS/Android)
- [ ] Video recording
- [ ] Bulk upload/batch processing
- [ ] Team/multi-physician accounts
- [ ] Advanced voice commands

### 2.3 Scope Refinement COMPLETED ✅
All 5 passes completed with user input.

---

## 3. User Stories & Requirements

### 3.1 Core User Flows (Priority Order)

**Flow 1: New User Signup & First Recording**
```
1. User lands on app
2. Signs up (email/password)
3. Selects template or creates custom one
4. Enters patient demographics (name, DOB, MRN optional)
5. Records visit audio
6. Gets generated note
7. Reviews + edits note
8. Copies note to clipboard
9. Note is saved to cloud
```

**Flow 2: Returning User - Existing Visit Management**
```
1. User logs in
2. Views visit history (list/search/filter)
3. Selects existing visit
4. Edits/exports note
5. Deletes visit (optional)
```

**Flow 3: Template Management**
```
1. User creates/edits custom template
2. Template saved to cloud
3. Can use template in recordings
```

### 3.2 Functional Requirements (DRAFT)

**Authentication**
- Email/password signup & login
- Password reset flow
- Optional: Social login (Google)

**Recording**
- Record up to [X] minutes
- Real-time transcription display
- Pause/resume recording
- Cancel without saving

**Note Generation**
- Template-based structure
- Use ONLY spoken information (no hallucination)
- Support for patient demographics context
- Editable generated note

**Storage**
- Save to Supabase (PostgreSQL)
- Visits include: timestamp, patient info, template, transcript, generated note, user edits
- Max file size: [TBD]

**Search/Filter**
- Search by patient name
- Filter by date range
- Filter by template type
- Sort by date created

---

## 4. Architecture & Technical Design

### 4.1 High-Level Architecture (DRAFT)

```
┌─────────────────────────────────────────────────────────────────┐
│                    ENT Scribe v1 Architecture                    │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 16, React 19, TypeScript, Tailwind)           │
│  - Pages: Auth, Home, Record, Note, History, Templates          │
│  - Components: RecordButton, NoteEditor, TemplateForm, etc      │
│  - State: React Context + Supabase Realtime subscriptions       │
├─────────────────────────────────────────────────────────────────┤
│  Backend (Next.js API Routes + Edge Functions)                   │
│  - POST /api/transcribe → Deepgram (real-time streaming)        │
│  - POST /api/generate → Claude Opus 4.6 (via Anthropic API)     │
│  - POST/GET /api/visits → Supabase PostgreSQL                   │
│  - POST/GET /api/templates → Supabase PostgreSQL                 │
│  - POST/GET /api/auth → Supabase Auth                            │
│  - Encryption/decryption middleware for PII                      │
├─────────────────────────────────────────────────────────────────┤
│  Database (Supabase PostgreSQL + Vector Store for search)        │
│  - users (email, encrypted_name, auth via Supabase)             │
│  - visits (patient info, transcript, note, timestamps)          │
│  - templates (user custom + built-in ENT templates)             │
│  - audit_logs (compliance: all user actions logged)             │
├─────────────────────────────────────────────────────────────────┤
│  External Services & APIs                                        │
│  - Supabase (Auth + Database + Storage)                          │
│  - Deepgram (Real-time audio transcription)                      │
│  - Anthropic Claude API (Medical note generation)                │
│  - Vercel (Serverless hosting + edge functions)                  │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Database Schema (DRAFT)

```sql
-- Users table (managed by Supabase Auth, sync to custom table if needed)
CREATE TABLE users (
  id UUID PRIMARY KEY,
  email VARCHAR UNIQUE NOT NULL,
  full_name VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Visits table
CREATE TABLE visits (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  patient_name VARCHAR,
  patient_dob DATE,
  patient_mrn VARCHAR,
  template_id UUID REFERENCES templates(id),
  transcript TEXT,
  generated_note TEXT,
  edited_note TEXT,
  status VARCHAR ('generated', 'edited', 'saved'),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id, created_at)
);

-- Templates table
CREATE TABLE templates (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  template_name VARCHAR NOT NULL,
  template_fields JSONB,
  is_custom BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  INDEX(user_id)
);

-- Audit logs (optional - for compliance)
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  action VARCHAR,
  resource_type VARCHAR,
  resource_id UUID,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### 4.3 API Endpoints (DRAFT)

```
Authentication
  POST /api/auth/signup
  POST /api/auth/login
  POST /api/auth/logout
  POST /api/auth/refresh
  POST /api/auth/reset-password

Recordings & Transcription
  POST /api/transcribe (stream audio chunks → Whisper)

Note Generation
  POST /api/generate (transcript + template → GPT-4o)

Visits Management
  GET /api/visits (list user's visits with search/filter)
  GET /api/visits/[id] (get single visit)
  POST /api/visits (save new visit)
  PUT /api/visits/[id] (update visit)
  DELETE /api/visits/[id] (delete visit)

Templates Management
  GET /api/templates (list user's templates + built-ins)
  POST /api/templates (create custom template)
  PUT /api/templates/[id] (update template)
  DELETE /api/templates/[id] (delete custom template)
```

### 4.4 Scalability Considerations (for 1000+ users)

- **Database**: Supabase handles scaling; add indexes on frequently queried columns
- **API Rate Limiting**: Implement rate limiting per user (prevent OpenAI cost spikes)
- **Caching**: Cache OpenAI API responses if same prompt is repeated
- **File Storage**: Use Supabase Storage or S3 for audio files (optional)
- **Async Jobs**: Queue long-running transcription/generation tasks
- **Monitoring**: Set up error tracking (Sentry) and analytics (Mixpanel)
- **CDN**: Vercel handles static asset caching

---

## 5. Scope Refinement Questions (PASS 1-5)

### PASS 1: Authentication & Security
- [ ] Should we support social login (Google, Apple) in v1, or just email/password?
- [ ] Do we need HIPAA compliance from day 1, or phase it in?
- [ ] Should we encrypt PII (patient names) at rest in Supabase?
- [ ] Rate limit per user to prevent OpenAI cost overruns? If yes, limits?

### PASS 2: Recording & Features
- [ ] Max recording length? (current: unlimited)
- [ ] Should we support pausing/resuming a recording?
- [ ] Should notes auto-save to cloud, or only on explicit save?
- [ ] Real-time transcription or batch after recording ends?

### PASS 3: Data & Storage
- [ ] Retention policy - how long to keep deleted visits? (30 days, 90 days, forever?)
- [ ] Should we support exporting user data (GDPR export)?
- [ ] Should we store audio files, or just transcripts + notes?
- [ ] Do we need audit logging for compliance?

### PASS 4: Templates & Customization
- [ ] Should users be able to share custom templates with other users?
- [ ] Should templates have version history?
- [ ] Limit on # custom templates per user?

### PASS 5: Future Integrations (Phase 2 Planning)
- [ ] Which EHR systems are top priority? (Epic, eClinicalWorks, Cerner, other?)
- [ ] Should we design webhooks for real-time data sync?
- [ ] Should we plan for HL7/FHIR compatibility now?

---

## 6. Non-Functional Requirements

### 6.1 Performance Targets
- [ ] Page load time: < 2 seconds
- [ ] Recording to transcription latency: < 1 second
- [ ] Note generation latency: < 5 seconds
- [ ] Search results: < 500ms
- [ ] Bundle size: < 200KB (gzipped)

### 6.2 Security
- [ ] All API communication over HTTPS
- [ ] OpenAI API key stored in .env.local (never in client)
- [ ] Supabase RLS (Row Level Security) enforced
- [ ] No PII logged to console/monitoring
- [ ] CSP headers configured

### 6.3 Reliability
- [ ] 99.5% uptime SLA
- [ ] Graceful error handling for API failures
- [ ] Offline recording capability (TBD)
- [ ] Retry logic for transient failures

### 6.4 Accessibility
- [ ] WCAG 2.1 AA compliance
- [ ] Keyboard navigation for all features
- [ ] Screen reader testing
- [ ] High contrast mode support

---

## 7. Implementation Roadmap (DRAFT)

### Phase 0: Foundation (Week 1-2)
- [ ] Set up project structure & environment
- [ ] Supabase setup (auth + DB)
- [ ] Create base pages & layout
- [ ] Implement auth flow (signup/login)

### Phase 1: Core Recording (Week 2-3)
- [ ] Recording UI & Web Audio API
- [ ] Real-time transcription (Whisper streaming)
- [ ] Patient demographics form

### Phase 2: Note Generation (Week 3-4)
- [ ] Template-based note generation (GPT-4o)
- [ ] Note editor UI
- [ ] Copy-to-clipboard

### Phase 3: Storage & History (Week 4-5)
- [ ] Supabase visit storage
- [ ] Visit history page + search/filter
- [ ] Cloud sync

### Phase 4: Polish & Launch (Week 5-6)
- [ ] Testing & bug fixes
- [ ] Performance optimization
- [ ] Accessibility audit
- [ ] Deployment to Vercel

---

## 8. Technology Stack (CONFIRMED - v1)

| Layer | Technology | Purpose | Notes |
|-------|-----------|---------|-------|
| Frontend | Next.js 16, React 19, TypeScript 5 | Web app | App Router, Mobile-first |
| Styling | Tailwind CSS v4 | UI Design | Mobile-first responsive |
| Database | Supabase (PostgreSQL) | Data storage | Auth + Schema |
| Auth | Supabase Auth + Google OAuth | User management | Email + Google login |
| Transcription | **Deepgram** | Audio → Text | Real-time streaming |
| Note Generation | **Claude Opus 4.6** | Text → Medical note | Best medical reasoning |
| Encryption | TweetNaCl.js / libsodium | Data security | Encrypt PII at rest |
| Hosting | Vercel | Deployment | Serverless |
| Error Tracking | Sentry | Monitoring | Error logs (optional) |
| Analytics | Mixpanel | Usage metrics | Feature tracking (optional) |

---

## 9. Open Questions & TBDs

- [ ] Offline recording support?
- [ ] Audio file storage in v1?
- [ ] HIPAA compliance scope?
- [ ] Rate limiting strategy?
- [ ] Data retention policy?
- [ ] Performance targets (specific numbers)?
- [ ] Export formats (PDF, DOCX, HL7)?

---

## 10. Appendices

### A. Glossary
- **EHR**: Electronic Health Record
- **ENT**: Ear, Nose & Throat
- **PII**: Personally Identifiable Information
- **HIPAA**: Health Insurance Portability and Accountability Act
- **RLS**: Row Level Security (Supabase)

### B. References
- Supabase Docs: https://supabase.com/docs
- OpenAI API: https://platform.openai.com/docs
- Next.js 16: https://nextjs.org/docs
- WCAG 2.1: https://www.w3.org/WAI/WCAG21/quickref/

---

**Document Status:** AWAITING USER INPUT FOR SCOPE REFINEMENT PASSES 1-5
