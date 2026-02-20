# ENT Scribe Phase 2 - Software Design Document

**Project:** ENT Scribe Phase 2 (EHR Integrations & Advanced Features)
**Version:** 2.0
**Status:** PLANNING
**Depends On:** v1 completion
**Last Updated:** 2026-02-20

---

## Executive Summary

Phase 2 builds on v1's solid foundation to add **direct EHR integrations**, **training on doctor's past data**, and **advanced AI features** that make the scribe truly intelligent.

**Vision:** Transform ENT Scribe from a recording-to-note tool into a **fully integrated part of the clinical workflow** with bi-directional data sync and AI that learns each doctor's style.

---

## Phase 2 In-Scope

### 2.1 EHR Integrations (Priority Order)

#### 1. **eClinicalWorks Integration** (via copy/paste + API when available)
- Import patient demographics from eClinicalWorks
- Export generated notes back to eClinicalWorks charts
- Real-time patient history retrieval
- CPT/ICD code suggestions integrated into eClinicalWorks

#### 2. **Epic Integration** (via FHIR API)
- Full FHIR-compliant data exchange
- Patient record context (past visits, allergies, medications)
- Direct chart insertion of generated notes
- Structured data export (HL7)

#### 3. **Cerner Integration** (via FHIR API)
- FHIR-based patient data access
- Visit context from Cerner
- Note export to Cerner EHR

#### 4. **Generic FHIR/HL7 Support**
- Works with any FHIR-compliant EHR
- Standard data exchange format
- Extensible for future EHRs

### 2.2 AI Training & Customization

#### Doctor Profile & Learning
- **Upload past notes** - Doctor uploads 20+ past notes → train Claude on their style
- **Custom instructions** - Doctor sets preferences (e.g., "no em dashes", "short summaries", "emphasize patient quotes")
- **Feedback loop** - Doctor rejects/edits notes → system learns corrections
- **Style vector** - System builds a "style embedding" unique to each doctor

#### Fine-Tuning Strategy
- Use Anthropic **Prompt Caching** to store doctor's style instructions
- Build **custom prompts** per doctor that include their preferences
- Implement **Retrieval Augmented Generation (RAG)** to surface relevant past notes as examples

### 2.3 Advanced AI Features

#### 1. **Intelligent Gap Detection**
- System identifies missing template sections during visit
- If silence > 5 seconds in relevant section, scribe prompts: "Doc, I need more detail on your physical exam findings"
- Real-time template completion percentage shown

#### 2. **ICD-10 Code Suggestions**
- AI suggests relevant ICD-10 codes based on visit transcript and note
- Displays codes with CPT equivalents for billing optimization
- Doctor can accept/reject/edit before export

#### 3. **Keyword/Abbreviation Recognition**
- Upload specialty-specific keywords (e.g., "microtia", "cholesteatoma", "ossicular chain")
- System recognizes misspoken versions and auto-corrects
- Improves transcription accuracy for ENT-specific terminology

#### 4. **Differential Diagnosis Helper**
- AI suggests common ENT differentials based on symptoms mentioned
- Doctor can prompt: "What are the DDx for this presentation?"
- Only informational - doctor makes final clinical decision

#### 5. **Patient Education Generator**
- System generates patient-friendly summary of diagnosis/plan
- Doctor can include in post-visit instructions
- Improves patient outcomes and satisfaction

### 2.4 Agentic Scribe Features

#### Interactive Scribe Conversation
- Doctor talks to scribe mid-visit: "Hey scribe, add moderate hearing loss to assessment"
- Scribe updates template in real-time
- Scribe clarifies: "Should I put this under objective exam or assessment?"
- Two-way conversation (Deepgram TTS for scribe voice)

#### Hotkeys & Commands
- Pre-defined commands: "asterisks migraine" → "Bilateral migraine worsening despite Fexofenadine"
- Doctor can record voice snippets as shortcuts
- Command palette for quick insertions

#### Smart Context
- Scribe remembers patient from previous visits
- Shows previous findings: "Last visit you noted tympanic membrane perforation - still present?"
- Doctor confirms/updates past findings

### 2.5 Compliance & Security

#### HIPAA Compliance v2
- Business Associate Agreement (BAA) with all EHR vendors
- Encryption key management (doctor retains keys if needed)
- Audit trail export for compliance reviews
- De-identification tools for training data

#### Data Governance
- Doctor controls what data is used for training
- Right to delete training data
- Opt-out of AI learning per visit

---

## Architecture - Phase 2

### High-Level Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                   ENT Scribe Phase 2 Architecture             │
├──────────────────────────────────────────────────────────────┤
│  Frontend (Enhanced)                                          │
│  - EHR connection settings                                    │
│  - Doctor profile / training data upload                      │
│  - Code suggestions UI                                        │
│  - Agentic scribe chat interface                              │
├──────────────────────────────────────────────────────────────┤
│  Backend API Routes (Expanded)                                │
│  - POST /api/ehr/authenticate (OAuth to EHR)                 │
│  - GET /api/ehr/patient/:id (fetch patient data)             │
│  - POST /api/ehr/export (send note to EHR)                   │
│  - POST /api/train/upload (upload training data)             │
│  - POST /api/codes/suggest (ICD-10 suggestions)              │
│  - POST /api/scribe/chat (agentic scribe conversation)        │
├──────────────────────────────────────────────────────────────┤
│  Database Expansions                                          │
│  - doctor_profiles (style embedding, preferences)            │
│  - training_data (encrypted past notes)                       │
│  - ehr_connections (API credentials, mapping rules)          │
│  - icd_codes (reference table)                               │
│  - scribe_prompts (custom prompts per doctor)                │
├──────────────────────────────────────────────────────────────┤
│  External Services (NEW)                                      │
│  - EHR APIs (eClinicalWorks, Epic, Cerner via FHIR)          │
│  - Anthropic Prompt Caching (doctor style storage)           │
│  - Vector database (Pinecone/Supabase Vectors for RAG)       │
└──────────────────────────────────────────────────────────────┘
```

### Database Schema Additions

```sql
-- Doctor profiles with AI training
CREATE TABLE doctor_profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  style_embedding VECTOR(1536), -- OpenAI embeddings of doctor's style
  custom_instructions TEXT, -- e.g., "no em dashes, short summaries"
  preferred_codes_format VARCHAR, -- ICD-10, CPT, both
  voice_profile JSONB, -- Deepgram voice settings
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Training data (encrypted)
CREATE TABLE training_data (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES doctor_profiles(id),
  encrypted_past_note TEXT, -- Encrypted past EHR note
  note_source VARCHAR, -- 'ehr_import', 'manual_upload'
  imported_at TIMESTAMP DEFAULT NOW()
);

-- EHR connections
CREATE TABLE ehr_connections (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  ehr_type VARCHAR, -- 'epic', 'eclinicalworks', 'cerner', 'generic_fhir'
  oauth_token TEXT ENCRYPTED, -- Encrypted OAuth access token
  refresh_token TEXT ENCRYPTED,
  api_base_url VARCHAR,
  patient_mapping JSONB, -- How to map our fields to EHR fields
  connected_at TIMESTAMP DEFAULT NOW(),
  last_sync TIMESTAMP,
  UNIQUE(user_id, ehr_type)
);

-- ICD-10 code suggestions
CREATE TABLE icd_codes (
  id UUID PRIMARY KEY,
  code VARCHAR UNIQUE, -- e.g., 'H66.001'
  description VARCHAR,
  category VARCHAR, -- 'ear', 'nose', 'throat'
  cpt_codes TEXT[], -- Related CPT codes
  embedding VECTOR(1536) -- For semantic search
);

-- Custom prompts per doctor
CREATE TABLE scribe_prompts (
  id UUID PRIMARY KEY,
  doctor_id UUID REFERENCES doctor_profiles(id),
  prompt_name VARCHAR, -- 'style', 'icd_suggestion', 'gap_detection'
  prompt_content TEXT, -- The actual system prompt
  version INT DEFAULT 1,
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### API Endpoints (Phase 2 New)

```
EHR Management
  POST /api/ehr/connect (initiate OAuth flow)
  GET /api/ehr/callback (OAuth callback)
  GET /api/ehr/status (check connection status)
  DELETE /api/ehr/disconnect (revoke access)

Patient Data from EHR
  GET /api/ehr/patient/:id (get patient demographics)
  GET /api/ehr/patient/:id/history (get past visit notes)
  GET /api/ehr/patient/:id/allergies (get allergies)

Export to EHR
  POST /api/ehr/export/note (send generated note to EHR)
  POST /api/ehr/export/codes (send ICD-10 codes to EHR)

Training & Customization
  POST /api/train/upload-notes (upload past notes for training)
  POST /api/train/submit-feedback (doctor edits note, system learns)
  PUT /api/doctor/preferences (update custom instructions)
  GET /api/doctor/style-summary (show learned style)

AI Features
  POST /api/codes/suggest (get ICD-10 code suggestions)
  POST /api/keywords/add (add specialty keywords)
  POST /api/scribe/chat (conversational scribe)
  GET /api/scribe/gaps (what template sections are incomplete)
```

---

## Implementation Roadmap - Phase 2

### Phase 2a: EHR Foundations (Weeks 1-3)
- [ ] OAuth setup for EHR services
- [ ] Build patient data import (demographics, history)
- [ ] Note export to EHR
- [ ] FHIR compliance layer
- [ ] BAA templates for EHRs

### Phase 2b: AI Training (Weeks 2-4)
- [ ] Doctor profile schema
- [ ] Past note upload interface
- [ ] Style extraction from past notes
- [ ] Custom instructions UI
- [ ] Feedback loop implementation

### Phase 2c: Advanced AI (Weeks 3-5)
- [ ] ICD-10 code suggestion engine
- [ ] Intelligent gap detection
- [ ] Agentic scribe conversation
- [ ] Keyword/abbreviation recognition

### Phase 2d: Integration & Testing (Weeks 4-6)
- [ ] End-to-end EHR flow testing
- [ ] AI training validation
- [ ] HIPAA audit
- [ ] Launch to beta users

---

## Technology Stack - Phase 2

| Component | Technology | Purpose |
|-----------|-----------|---------|
| EHR Connectors | OAuth 2.0, FHIR APIs | EHR data access |
| AI Training | Anthropic Prompt Caching, RAG | Doctor personalization |
| Vector DB | Supabase pgvector or Pinecone | Semantic search of past notes |
| Encryption | libsodium + envelope keys | End-to-end encryption |
| Code Reference | ICD-10 + CPT databases | Code suggestions |
| Monitoring | Healthcare-specific logging | HIPAA audit trails |

---

## Business Impact - Phase 2

### Doctor Efficiency Gains
- **Recording time:** 5 min → 3 min (scribe helps fill gaps)
- **Note review time:** 10 min → 5 min (scribe is personalized)
- **EHR entry time:** 5 min → 0 min (auto-exported)
- **Total saved:** ~12 min per visit = 2 hours per 10 visits

### Cost Savings vs. Human Scribe
- Human scribe: $40-50k/year
- ENT Scribe: ~$100-200/year (API costs) per user
- **Savings: $40k+ per doctor per year**

### Market Expansion
- Becomes **must-have tool** for group practices
- Enables small practices to operate like large health systems
- Premium pricing opportunity ($200-500/month)

---

## Notes & Assumptions

- EHR integrations require long sales cycles - may launch Phase 2 staggered by EHR
- Training on past data is opt-in to manage liability
- HIPAA compliance is critical for healthcare adoption
- AI learning must be transparent to doctor (what data is used, how to delete)

---

**Status:** Awaiting v1 completion before Phase 2 development begins.
