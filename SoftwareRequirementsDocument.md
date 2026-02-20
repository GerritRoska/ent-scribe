# Software Requirements Document (SRD)

## Project
ENT Scribe V1 (Supabase-first)

## Date
2026-02-18

## 1) Objective
Build a one-clinician V1 ambient ENT scribe with a foundation that can scale later, including:
- Secure sign-in
- Cloud data persistence
- Real-time transcription
- ENT-formatted note generation
- Code suggestions with documentation-gap checks
- Copy/paste workflow for eClinicalWorks

V1 remains copy/paste into EHR. Direct EHR integration is deferred.

## 2) Product Scope

### In Scope (V1)
- Next.js web app for recording, transcript, note, and coding workflow
- Supabase Auth (email magic link, restricted to approved clinician email)
- Supabase Postgres persistence for templates and visit history
- Row Level Security (RLS) on all user-owned tables
- Deepgram live transcription
- AI note generation + AI coding suggestions + clarification loop

### Out of Scope (V1)
- Direct eClinicalWorks API writeback
- Multi-provider teamspaces and org admin
- Full CPT data redistribution
- Autonomous billing/coding without physician review

## 3) Current Codebase Baseline
Current repo already has:
- Recording flow and template picker (`app/page.tsx`, `app/record/page.tsx`)
- Server routes for transcription and note generation (`app/api/transcribe/route.ts`, `app/api/generate/route.ts`)
- ENT default template system (`lib/templates.ts`)
- Note review and copy flow (`app/note/page.tsx`)

Current gaps:
- No auth
- No database
- Visit/template persistence is browser local storage only

## 4) Recommended Architecture (Supabase-first)

### Frontend
- Keep current Next.js App Router UI.
- Add auth gate (magic-link sign-in).
- Keep current screens and add:
  - Auth state handling
  - Cloud-synced templates/history

### Backend/API
- Keep provider secrets server-side.
- Add route handlers:
  - `POST /api/deepgram/token`
  - `POST /api/coding/suggest`
  - `POST /api/coding/finalize`
  - `GET/POST /api/visits`
  - `GET/POST/PATCH/DELETE /api/templates`

### Data Layer (Supabase)
- Supabase Auth for user identity.
- Supabase Postgres for storage.
- RLS policies enforce per-user isolation (`user_id = auth.uid()`).

### AI Flow (3-pass)
1. Transcript -> ENT note draft
2. Note draft -> CPT/ICD suggestions with confidence + evidence
3. Note + selected codes -> documentation-gap questions

Physician answers clarifying questions, then system regenerates final note/codes.

## 5) Database Design (Initial)

### `profiles`
- `id uuid primary key` (references `auth.users.id`)
- `email text unique`
- `display_name text`
- `created_at timestamptz`

### `templates`
- `id uuid primary key`
- `user_id uuid not null`
- `name text not null`
- `content text not null`
- `is_default boolean not null default false`
- `created_at timestamptz`
- `updated_at timestamptz`

### `visits`
- `id uuid primary key`
- `user_id uuid not null`
- `template_id uuid null`
- `patient_name text null`
- `patient_dob date null`
- `transcript text not null`
- `note text not null`
- `coding_result jsonb null`
- `created_at timestamptz`

### RLS Requirements
- Enable RLS on `profiles`, `templates`, `visits`.
- Read/write only where `user_id = auth.uid()` (or `id = auth.uid()` for `profiles`).

## 6) Functional Requirements

### FR-1 Authentication
- User can sign in with magic link email.
- Only approved email(s) can access the app in V1.
- User can sign out.

### FR-2 Audio Capture
- Start/pause/resume/stop recording.
- Show live timer and recording state.
- Handle mic-denied state cleanly.

### FR-3 Real-Time Transcription
- Show interim transcript quickly (target <= 3s).
- Show finalized transcript segments.
- Preserve transcript after stop.

### FR-4 Note Generation
- Generate ENT-structured note from transcript + selected template.
- No fabrication; use "Not documented" for missing sections.
- Note is always editable before copy/export.

### FR-5 Coding Suggestions
- Return CPT/ICD suggestions tied to evidence from transcript/note.
- Return confidence + missing documentation items per suggested code.

### FR-6 Clarification Loop
- Ask targeted questions needed to defend selected codes.
- Incorporate physician answers and regenerate final output.

### FR-7 Cloud Persistence
- Save/retrieve templates from Supabase.
- Save/retrieve visit history from Supabase.
- Keep default ENT templates available for every user.

### FR-8 Output
- One-click copy note.
- Download plaintext note.

### FR-9 Session and Access Safety
- If auth session expires, block further API writes and prompt re-auth without losing unsaved draft.
- Enforce ownership checks server-side for every `:id` resource (`visit`, `template`) even when RLS is enabled.
- Mutating endpoints must be idempotent (client request ID) to prevent duplicate visit/template writes on retries.

## 7) Non-Functional Requirements

### NFR-1 Security
- No long-lived Deepgram or LLM keys in browser.
- Use temporary Deepgram tokens.
- Enforce Supabase RLS.
- Keep `SUPABASE_SERVICE_ROLE_KEY` server-only; never bundled client-side.
- Validate authn/authz on every API route before provider calls (fail closed).
- Add API rate limits and abuse controls on auth, transcription, and AI endpoints.
- Protect mutating routes against CSRF for cookie-authenticated flows (SameSite + origin checks and/or anti-CSRF token).
- Apply strict input validation and payload size limits (transcript size, template size, JSON shape).
- Log security-relevant events (auth failures, denied access, rate-limit hits) without storing PHI in logs.
- Add secure default headers for API routes (at minimum `Cache-Control: no-store` for PHI responses).

### NFR-2 Privacy/Compliance
- PHI processing disclaimer in UI.
- Vendor BAAs required before clinical production use.
- Minimize retention and avoid unnecessary logs.
- Define retention windows for transcript/note/visit artifacts and implement deletion jobs.
- Support user-initiated deletion for visit data.
- Encrypt PHI in transit (TLS) and at rest via managed provider controls.
- Do not persist raw audio by default in V1 unless explicitly enabled and retained with policy.

### NFR-3 Reliability
- Retry transient provider failures.
- Keep note editor usable even if coding endpoint fails.
- Idempotent save endpoints for safe retries.

### NFR-4 Performance
- First interim transcript <= 3s.
- Note generation <= 12s for average visit.
- Main workflow remains responsive during background calls.

### NFR-5 Observability
- Every provider call has request ID, latency metric, and error class.
- Alert when provider error rate, timeout rate, or note-generation latency crosses threshold.
- Maintain audit trail for note/coding regeneration actions (who, when, why).

## 8) Billing Strategy (Pragmatic + Legal)

### CPT
- Use curated ENT CPT shortlist for V1 (top codes your dad actually bills).
- Do not redistribute full licensed CPT dataset.

### ICD-10
- Use ICD-10 lookup source for search/validation support.

### Guardrail
- AI must only suggest codes supported by explicit documentation.
- If support is weak, system must ask clarification questions instead of guessing.

## 9) API Contracts (Proposed)

### `POST /api/deepgram/token`
Returns short-lived Deepgram token.

### `POST /api/generate`
Transcript + template -> note draft.

### `POST /api/coding/suggest`
Note -> suggested CPT/ICD + evidence + missing documentation.

### `POST /api/coding/finalize`
Note + clarifications -> final note + updated coding output.

### `GET /api/visits`
List current user visits (most recent first).

### `POST /api/visits`
Create/update visit draft/final.

### `GET /api/templates`
List default + user custom templates.

### `POST /api/templates`
Create custom template.

### `PATCH /api/templates/:id`
Update custom template.

### `DELETE /api/templates/:id`
Delete custom template.

## 10) Code Structure (Recommended)

- `lib/supabase/`
  - `browser.ts` (client)
  - `server.ts` (server route handlers)
  - `queries.ts` (templates/visits data access)
- `lib/ai/`
  - `note-generator.ts`
  - `coding-suggester.ts`
  - `coding-finalizer.ts`
- `lib/transcription/`
  - `deepgram-token.ts`
  - `deepgram-stream.ts`
- `lib/schemas/`
  - `coding.ts`
  - `visit.ts`
  - `template.ts`
- `app/api/...` thin route handlers only

Rules:
- Keep provider and DB logic out of React components.
- Validate AI JSON outputs at runtime before rendering/saving.
- Keep fallback local draft cache only for temporary unsaved work, not primary storage.
- Never trust model output as executable instructions; treat model output as untrusted data.

## 11) Implementation Plan (One-by-one)

### Phase 0: Supabase Bootstrap (0.5 day)
- Create Supabase project.
- Add env vars:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `DEEPGRAM_API_KEY`
  - `OPENAI_API_KEY` (or selected LLM key)
- Create `profiles`, `templates`, `visits` tables.
- Enable RLS and add policies.

### Phase 1: Auth First (0.5 day)
- Add magic link sign-in page and sign-out.
- Restrict access to approved email list for V1.
- Add middleware/session check so app is private.

### Phase 2: Data Migration (0.5-1 day)
- Replace localStorage template CRUD with Supabase CRUD.
- Replace visit-history localStorage with Supabase visits table.
- Keep optional one-session draft in sessionStorage only.

### Phase 3: Deepgram Live Transcription (0.5-1 day)
- Add `/api/deepgram/token`.
- Migrate record page to websocket streaming for interim/final transcript.

#### Phase 3 Checklist: Deepgram Implementation Plan
- [ ] Add env vars:
  - `DEEPGRAM_API_KEY`
  - `DEEPGRAM_MODEL` (default `nova-3-medical`)
  - `TRANSCRIPTION_PROVIDER` (default `deepgram`)
- [ ] Implement provider abstraction in `app/api/transcribe/route.ts` so OpenAI and Deepgram can be toggled by env.
- [ ] Phase 3A first release (recommended): ship Deepgram pre-recorded upload path before websocket migration.
- [ ] Use pre-recorded defaults for ENT documentation quality:
  - `smart_format=true`
  - `punctuate=true`
  - `numerals=true`
  - `diarize=true`
  - `paragraphs=true`
  - `utterances=true`
  - `keyterm` list (ENT anatomy, procedures, medications, clinician/patient names; max 100)
- [ ] Keep these off by default unless explicitly needed:
  - `profanity_filter`
  - `replace`
  - `search`
  - `filler_words`
  - `redact` (enable only for masked-output workflows)
- [ ] Evaluate against baseline on 20-30 real visit recordings:
  - medical term recognition accuracy
  - speaker separation quality
  - note completeness after generation
  - transcription latency and failure rate
- [ ] Phase 3B second release: websocket streaming with temporary Deepgram tokens.
- [ ] Streaming defaults when Phase 3B starts:
  - `interim_results=true`
  - `endpointing=400` (tune between 300-500)
  - `utterance_end_ms=1000`
  - `vad_events=true`
- [ ] Add fallback behavior: if streaming fails, continue with pre-recorded chunk transcription so note generation is never blocked.
- [ ] Security gate before production:
  - Deepgram API key is server-only (never in browser)
  - temporary token TTL <= 60s
  - PHI disclosure and BAA verification complete

### Phase 4: Coding Endpoints (0.5 day)
- Add `/api/coding/suggest`.
- Add UI panel for suggestions + missing documentation.

### Phase 5: Clarification Loop + Finalization (0.5 day)
- Add `/api/coding/finalize`.
- Regenerate note/codes from physician answers.

### Phase 6: Hardening (0.5 day)
- Error states, retries, timeout handling.
- Final disclaimers and smoke tests.
- Add rate limiting, payload size guards, and PHI-safe logging.
- Add request IDs and basic operational metrics.

### Phase 7: Verification Gate (0.5 day)
- Run security and edge-case verification checklist (Section 13A + 13B).
- Block production release unless all required checks pass.

## 12) Fastest 12-hour Cut (still Supabase-based)
If you need a same-day build:
- Phase 0 + Phase 1 + Phase 2
- Keep existing note generation
- Add Deepgram streaming
- Defer clarification loop to next increment

This gives auth + DB foundation now, without blocking fast delivery.

## 13) Testing Requirements

### Unit
- Schema validation for AI outputs.
- Data access helpers (`templates`, `visits`) with auth context checks.

### Integration
- Auth-protected routes reject anonymous access.
- RLS prevents cross-user access.
- `/api/deepgram/token`, `/api/generate`, `/api/coding/suggest` return valid responses.
- Service-role code paths are server-only and never reachable from browser bundles.
- Rate limits enforced on `POST /api/deepgram/token`, `POST /api/generate`, `POST /api/coding/*`.

### Manual UAT
- Full flow on 5 ENT visit types.
- Validate transcript quality, note quality, and coding explanation usefulness.

## 13A) Edge Case Matrix (Required)
- Mic denied at start and mid-visit device unplug.
- Browser refresh/tab close during recording with unsaved transcript.
- Network drop during websocket stream; fallback to pre-recorded/chunk transcription path.
- Duplicate submit (double-click, retry-after-timeout) does not create duplicate visits.
- Supabase temporarily unavailable; user sees recoverable state and can retry safely.
- LLM returns malformed JSON, partial output, or timeout; UI remains usable with clear fallback.
- Long transcript/token overflow scenario; chunking or truncation policy applied deterministically.
- Session expiration while editing note; preserve draft and require re-auth before save/finalize.
- Two tabs editing same visit; detect conflict and require explicit user choice.
- Allowlist mismatch (signed in but not approved) returns safe denial with sign-out path.

## 13B) Security Verification Gate (Must Pass Before Production)
- AuthZ negative tests: user A cannot read/update/delete user B templates/visits.
- RLS policy tests run in CI for `profiles`, `templates`, and `visits`.
- Secret exposure check: no server secrets in client bundle/build output.
- Dependency vulnerability scan run and triaged before release.
- Abuse tests: rate-limit thresholds verified for auth/token/generation endpoints.
- Input validation tests: oversized payloads and invalid schemas rejected with safe errors.
- CSRF tests: cross-site form/request attempts to mutating endpoints are rejected.
- Logging review: no PHI in structured logs for API and provider errors.
- Vendor/compliance gate: BAA status documented for all PHI processors.
- Release artifact required: dated verification report with pass/fail evidence for each item.

## 14) Risks and Mitigations
- Risk: Added auth/DB complexity slows initial build.
  - Mitigation: Use single-email allowlist + simple schema first.
- Risk: AI suggests unsupported codes.
  - Mitigation: evidence+confidence+missing-documentation output required.
- Risk: PHI/privacy concerns.
  - Mitigation: BAAs, minimal retention, secure defaults, restricted access.
- Risk: Prompt injection in transcript/note content affects downstream coding output.
  - Mitigation: fixed system rules, strict output schema validation, and no tool/action execution from model text.
- Risk: Endpoint abuse/cost spikes from automated requests.
  - Mitigation: per-user/IP rate limits, quotas, and anomaly alerting.

## 15) Definition of Done (V1)
- Clinician signs in successfully.
- Templates and visits persist in Supabase.
- Record -> transcript -> note -> code suggestions -> copy works end-to-end.
- Suggestions include evidence and documentation gaps.
- Secrets are never exposed in browser code.
- Edge-case matrix scenarios pass with documented outcomes.
- Security verification gate (Section 13B) is fully passed and signed off.

---

## Source Notes (primary references)
- Deepgram streaming API: https://developers.deepgram.com/reference/speech-to-text/listen-streaming
- Deepgram temporary token API: https://developers.deepgram.com/reference/auth/grant-token
- Deepgram model guidance: https://developers.deepgram.com/docs/model
- Deepgram HIPAA/BAA docs: https://developers.deepgram.com/docs/hipaa-compliance
- MDN `getUserMedia`: https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia
- MDN `MediaRecorder`: https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder
- Supabase Auth docs: https://supabase.com/docs/guides/auth
- Supabase RLS docs: https://supabase.com/docs/guides/database/postgres/row-level-security
- Supabase API keys (`service_role` guidance): https://supabase.com/docs/guides/api/api-keys
- NIH ICD-10 API docs: https://clinicaltables.nlm.nih.gov/apidoc/icd10cm/v3/doc.html
- AMA CPT licensing overview: https://www.ama-assn.org/practice-management/cpt/cpt-licensing-overview
- OWASP API Security Top 10 (2023): https://owasp.org/API-Security/editions/2023/en/0x11-t10/
- OWASP ASVS (v5): https://owasp.org/www-project-application-security-verification-standard/
- OWASP CSRF Prevention Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Cross-Site_Request_Forgery_Prevention_Cheat_Sheet.html
- NIST Secure Software Development Framework (SP 800-218): https://csrc.nist.gov/pubs/sp/800/218/final
- HIPAA Security Rule technical safeguards (45 CFR 164.312): https://www.ecfr.gov/current/title-45/subtitle-A/subchapter-C/part-164/subpart-C/section-164.312
