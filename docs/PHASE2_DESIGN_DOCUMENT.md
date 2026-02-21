# ENT Scribe v2 - Design Document (Post v1 Launch)

**Status:** Planning / Post v1 Launch
**Timeline:** 3-4 months after v1 stable
**Last Updated:** 2026-02-20

---

## Executive Summary

Phase 2 transforms ENT Scribe from a standalone tool into an **integrated medical ecosystem**. After v1 proves the core concept (record → transcribe → generate), Phase 2 focuses on **EHR integrations**, **scalability**, **advanced analytics**, and **team features**.

**Vision:** ENT Scribe becomes the "Jarvis for ENT doctors" across healthcare organizations.

---

## Phase 2 Scope: What's Added

### 1. 🏥 Direct EHR Integrations (Major Feature)

**Goal:** Write notes directly into physician's EHR without copy/paste

#### 1.1 FHIR/HL7 Compliance
- Implement FHIR R4 standard compliance
- Support HL7 v2.5 (legacy systems)
- Generic integration layer (works with any EHR)
- Create `/api/ehr/fhir` routes for EHR data exchange

#### 1.2 Native EHR Connectors
Build specific integrations for:

**Epic (Largest market - $8B+ revenue)**
- FHIR-based integration
- Patient context passthrough
- Seamless note insertion
- Authentication via EHR SSO

**eClinicalWorks (Popular with small practices)**
- Direct API integration
- Patient demographics sync
- Note export to template
- Bulk import of past notes for training

**Cerner (Hospital systems)**
- HL7 interface
- CCDA document generation
- Patient history integration

**Others (Athena, Medidata, NextGen):**
- Generic FHIR connector
- Webhook-based sync

#### 1.3 EHR Data Access
- Read patient demographics from EHR
- Read past visit notes for context
- Read allergy list, med list, PMHx
- Read patient encounter history
- Securely store EHR credentials (OAuth2)

**Architecture:**
```
ENT Scribe ←→ EHR OAuth2 ←→ EHR System
              (secure token)     (patient data)
```

---

### 2. 📊 Advanced Analytics & Dashboard

#### 2.1 Physician Dashboard
Metrics per doctor:
- Total visits recorded
- Average note generation time
- Note quality score (user feedback)
- Most common diagnoses
- Revenue impact (estimated billing)
- Top templates used
- Time saved vs. manual documentation

**Example dashboard:**
```
╔════════════════════════════════════╗
║  ENT Scribe - Your Stats (Feb 26)  ║
╠════════════════════════════════════╣
║  Total Visits: 287                 ║
║  Avg Time to Note: 45 sec          ║
║  Est. Time Saved: 191 hours/month  ║
║  Estimated Revenue Protected: $42K ║
║                                    ║
║  Top Diagnoses:                    ║
║  • Otitis media: 45 cases          ║
║  • Sinusitis: 38 cases             ║
║  • Tinnitus: 22 cases              ║
╚════════════════════════════════════╝
```

#### 2.2 Organization Dashboard (Admin)
For practice managers/IT:
- Total physician usage
- Cost per note (Deepgram + Claude API)
- ROI calculation (time saved → cost saved)
- Billing impact analysis
- User adoption rates
- Error rates / API failures
- Compliance metrics (audit log activity)

#### 2.3 Usage Analytics
- Track feature adoption (recording → note generation → export)
- Identify power users vs. casual users
- Measure where users struggle (drop-off points)
- A/B test UI changes
- Monitor API performance

---

### 3. 👥 Team & Organization Features

#### 3.1 Multi-User Organizations
- Create organization account (practice/hospital)
- Invite physicians to organization
- Role-based access control (RBAC):
  - Physician: Use scribe, see own analytics
  - Practice Manager: See org analytics, manage billing
  - Administrator: Manage users, configure integrations, audit logs

#### 3.2 Template Library (Public/Shared)
- Physicians can share custom templates with organization
- Eventually: Public template marketplace
  - Top ENT templates available to all
  - Community ratings/reviews
  - Version control for templates
- Example: "Jones ENT's Hearing Eval Template (4.8★ 250 uses)"

#### 3.3 Organization Settings
- Configure defaults (template, billing codes, EHR integration)
- Manage SSO (Single Sign-On) via Azure AD / Okta
- Configure audit logging retention
- API rate limiting per organization
- Billing/invoicing management

---

### 4. 💾 Advanced Data Management

#### 4.1 EHR Data Training
Allow physicians to upload past EHR data:
- Bulk import of 100+ past notes
- Claude trains on physician's writing style
- Fine-tuning customization (tone, length, detail level)
- Separate model per physician (optional)

#### 4.2 Data Export & Compliance
- Export visits as FHIR bundle (healthcare standard)
- Export as CCDA (Continuity of Care Document)
- GDPR data export (all user data)
- Compliance audit trail
- Data deletion with verification

#### 4.3 Backup & Sync
- Automatic daily backups to S3
- Disaster recovery procedures
- Multi-region redundancy (optional premium)

---

### 5. 🔐 Enterprise Security & Compliance

#### 5.1 HIPAA Level Security
- BAA (Business Associate Agreement) with vendors
- Encryption at rest (AES-256) and in transit (TLS 1.3)
- PII tokenization (replace patient names with tokens)
- Audit logging with immutable records
- Data retention policies enforced
- Compliance certifications (SOC 2 Type II)

#### 5.2 SSO & OAuth2
- SAML 2.0 support
- Azure AD, Okta, Google Workspace integration
- Automatic provisioning/deprovisioning

#### 5.3 IP Whitelisting & VPN
- Restrict API access by IP (enterprise)
- VPN/Private Link support

---

### 6. 🎯 Advanced AI Features

#### 6.1 Smarter Scribe Agent
- Real-time clarification during recording
- Predict missing information (ask proactively)
- Explain clinical reasoning
- Suggest alternative diagnoses
- Verify facts with medical databases

#### 6.2 CPT/ICD Code Optimization
- Real-time code suggestions
- Verify codes against insurance requirements
- Flag missing codes for better billing
- Pre-review for billing accuracy

#### 6.3 Clinical Decision Support (CDS)
- Drug interaction checking
- Allergy warnings
- Evidence-based guideline suggestions
- Dosing calculator integration

**Example:**
```
Doctor: "Prescribing amoxicillin"
Scribe: "⚠️  Patient is allergic to penicillin (in chart).
         Consider azithromycin instead."
```

---

### 7. 📱 Mobile & Cross-Platform

#### 7.1 Native Mobile Apps
- React Native for iOS/Android
- Feature parity with web
- Offline recording (sync when online)
- Push notifications for organization messages

#### 7.2 Smartwatch Support
- Voice recording initiation
- Quick note access
- Alerts from scribe

#### 7.3 Browser Extensions
- Already exists (Phase 1)
- Enhance: Side-by-side with EHR
- Popup recording control
- Quick note preview

---

### 8. 💰 Monetization & Pricing Tiers

#### 8.1 Pricing Model
**Freemium:**
- Free: 10 visits/month (free tier / trial)
- $29/month: Unlimited visits (solo physician)
- $99/month: Org license (5 physicians)
- $499/month: Enterprise (unlimited users, EHR integration, SSO)

**Per-API costs:**
- Deepgram: ~$0.05 per visit (user pays)
- Claude Opus: ~$0.30 per visit (user pays)
- Infrastructure: Covered in subscription

#### 8.2 Enterprise Billing
- Annual contracts
- Volume discounts
- Custom integrations (EHR-specific)
- Dedicated support

---

### 9. 🏆 Compliance & Certifications

By v2 launch:
- [ ] HIPAA Compliance (BAA signed)
- [ ] SOC 2 Type II Certification
- [ ] GDPR Compliance (EU data handling)
- [ ] FDA Assessment (is it a medical device?)
- [ ] State licensing review (telemedicine implications)

---

### 10. 🎓 Training & Onboarding

#### 10.1 Physician Training
- Interactive onboarding (5 min walkthrough)
- Video tutorials for advanced features
- FAQ database
- Live support chat

#### 10.2 Organization Setup
- Dedicated onboarding manager for enterprise
- Integration configuration assistance
- Custom training for IT teams

---

## Phase 2 Implementation Timeline

```
Month 1: FHIR/HL7 foundation + Epic pilot
Month 2: eClinicalWorks + analytics dashboard
Month 3: Team features + SSO
Month 4: Mobile apps + compliance certifications
```

---

## Phase 2 Success Metrics

| Metric | Target | Rationale |
|--------|--------|-----------|
| Direct EHR integration rate | 40% | Reduces friction for adoption |
| Physician retention | 85%+ | Stickiness = revenue |
| Average visits per physician/month | 50+ | Proof of value |
| Org satisfaction | 4.5/5★ | Net Promoter Score |
| Uptime | 99.9% | Enterprise requirement |
| HIPAA compliance | Certified | Legal requirement |

---

## Phase 2 Technology Additions

| Technology | Purpose | Integration |
|---|---|---|
| FHIR/HL7 | EHR standards | API routes |
| OAuth2 | EHR authentication | Auth flow |
| Stripe | Billing | Subscription management |
| Segment | Analytics | Event tracking |
| Okta / Azure AD | SSO | Authentication |
| AWS S3 | Backup storage | Data retention |
| SendGrid | Email | Notifications |
| Sentry | Error tracking | Monitoring |

---

## Phase 2 Architecture Changes

```
v1 Architecture (Simple)
┌──────────────────────┐
│  ENT Scribe (SaaS)   │
├──────────────────────┤
│  Supabase            │
│  Claude API          │
│  Deepgram API        │
└──────────────────────┘

v2 Architecture (Enterprise)
┌──────────────────────────────────────────┐
│         ENT Scribe Enterprise             │
├──────────────────────────────────────────┤
│  Multi-org, RBAC, SSO, Billing           │
├──────────────────────────────────────────┤
│  Core Engine (Recording → Note Gen)      │
├──────────────────────────────────────────┤
│  EHR Integration Layer (FHIR/HL7)        │
│  ├─ Epic Connector                        │
│  ├─ eClinicalWorks Connector             │
│  ├─ Cerner Connector                     │
│  └─ Generic FHIR (all others)            │
├──────────────────────────────────────────┤
│  Analytics Engine                        │
│  ├─ Per-physician dashboard              │
│  └─ Org-wide analytics                   │
├──────────────────────────────────────────┤
│  Data & Compliance                       │
│  ├─ Audit logging                        │
│  ├─ Encryption (AES-256)                 │
│  ├─ Backup (S3)                          │
│  └─ Compliance (HIPAA, SOC2)             │
├──────────────────────────────────────────┤
│  Infrastructure                          │
│  ├─ Supabase (enhanced)                  │
│  ├─ Deepgram                             │
│  ├─ Claude API                           │
│  ├─ Stripe (billing)                     │
│  ├─ AWS (storage)                        │
│  └─ Vercel (CDN)                         │
└──────────────────────────────────────────┘
```

---

## Phase 2 Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|-----------|
| EHR integration complexity | High | Start with FHIR (generic), pilot Epic first |
| Compliance delays | High | Hire HIPAA expert, plan early |
| API costs balloon | Medium | Implement caching, rate limiting |
| Enterprise sales cycle | Medium | Build sales/marketing team early |
| Competition | Medium | First-mover advantage, strong UX, data lock-in |

---

## Phase 2 Success Looks Like

🎯 **6 months after v1 launch:**
- 100+ active physicians
- 5,000+ visits recorded
- 3 EHR integrations live (Epic, eClinicalWorks, generic FHIR)
- 2+ organizations signed (not just individual doctors)
- $20K+ MRR (monthly recurring revenue)
- HIPAA certification in progress
- Mobile apps in beta

---

## Phase 2 Go/No-Go Criteria (Before Starting)

Only start Phase 2 if:
- [ ] v1 has 50+ active users
- [ ] Net Promoter Score > 40
- [ ] No critical bugs in production
- [ ] Team ready to scale (hire engineers, sales)
- [ ] Funding secured ($500K+ for 6-month sprint)

---

## Appendix: EHR Integration Deep Dive (Coming in detailed Phase 2 spec)

Each EHR will get its own detailed integration guide:
- Epic: FHIR endpoints, OAuth2 flow, patient lookup
- eClinicalWorks: API auth, note insertion, data sync
- Cerner: HL7 mapping, patient context, audit trail
- Generic FHIR: Standard for all others

**See:** `PHASE2_EHR_INTEGRATION_SPEC.md` (to be created)

---

**This roadmap positions ENT Scribe for $10M+ valuation by scaling to enterprise healthcare.**

Next phase review: After v1 is stable and in use by 50+ physicians.
