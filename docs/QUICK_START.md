# ENT Scribe v1 - Quick Start Guide for Developers

**Status:** ✅ Ready to Build
**Documentation Complete:** 90%
**Code Examples:** Included
**Estimated Build Time:** 6 weeks (2-3 developers)

---

## 📦 What's Ready

### ✅ Complete Documentation
- [x] **SOFTWARE_DESIGN_DOCUMENT.md** - Full architecture, database schema, APIs
- [x] **docs/PHASE2_DESIGN_DOCUMENT.md** - Future roadmap (EHR integrations, advanced AI)
- [x] **docs/IMPLEMENTATION_ROADMAP.md** - Week-by-week timeline with checkpoints
- [x] **V1_LAUNCH_SUMMARY.md** - Scope summary and success criteria
- [x] **Component Instructions (3 of 8 started):**
  - [x] **1_AUTH_INSTRUCTIONS.md** - Complete with code examples
  - [x] **2_RECORDING_INSTRUCTIONS.md** - Complete with code examples
  - [x] **3_TRANSCRIPTION_INSTRUCTIONS.md** - Complete with code examples
  - [ ] 4_NOTE_GENERATION_INSTRUCTIONS.md (coming)
  - [ ] 5_STORAGE_INSTRUCTIONS.md (coming)
  - [ ] 6_HISTORY_INSTRUCTIONS.md (coming)
  - [ ] 7_TEMPLATES_INSTRUCTIONS.md (coming)
  - [ ] 8_INTERACTIVE_SCRIBE_INSTRUCTIONS.md (coming)
- [ ] **THEME.md** - In progress (design system)
- [ ] **CODING_STANDARDS.md** - In progress (dev standards)

---

## 🚀 Start Here (5-Minute Setup)

### 1. Clone & Install
```bash
git clone https://github.com/GerritRoska/ent-scribe.git
cd ent-scribe
git checkout claude/review-codebase-nh6L5  # Development branch
npm install
```

### 2. Get API Keys

#### Supabase (Auth + Database)
1. Go to https://supabase.com
2. Create new project
3. Get URL and Anon Key from **Settings → API**

#### Google OAuth
1. Go to https://console.cloud.google.com
2. Create OAuth 2.0 credentials
3. Get Client ID and Secret

#### Deepgram (Transcription)
1. Go to https://console.deepgram.com
2. Create API key
3. Use `nova-2-medical` model

#### Anthropic Claude (Note Generation)
1. Go to https://console.anthropic.com
2. Create API key
3. Use `claude-opus-4-6` model

### 3. Configure Environment
```bash
# Create .env.local
cp .env.example .env.local
```

Add to `.env.local`:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>

# Google OAuth
NEXT_PUBLIC_GOOGLE_CLIENT_ID=<client-id>
GOOGLE_CLIENT_SECRET=<client-secret>

# Deepgram
NEXT_PUBLIC_DEEPGRAM_API_KEY=<deepgram-api-key>

# Claude
ANTHROPIC_API_KEY=<claude-api-key>

# App Config
NEXT_PUBLIC_SITE_URL=http://localhost:3000 (local) or your domain (prod)
```

### 4. Start Development
```bash
npm run dev
# Open http://localhost:3000
```

---

## 📋 What to Build (Priority Order)

### Week 1-2: Foundation (Auth + Recording)
```
Developer 1: Follow 1_AUTH_INSTRUCTIONS.md
Developer 2: Follow 2_RECORDING_INSTRUCTIONS.md + 3_TRANSCRIPTION_INSTRUCTIONS.md

Deliverables:
✅ Users can sign up / login
✅ Users can record patient visits with real-time transcription
✅ Audio chunks stream to Deepgram successfully
✅ Transcript displays in real-time
```

### Week 3: Note Generation
```
Developer 3: Follow 4_NOTE_GENERATION_INSTRUCTIONS.md

Deliverables:
✅ Transcript sent to Claude Opus 4.6
✅ Template-based prompting works
✅ Generated notes display in editor
✅ User can edit note before saving
```

### Week 4-5: Storage + Advanced Features
```
Developer 1: Follow 5_STORAGE_INSTRUCTIONS.md + 6_HISTORY_INSTRUCTIONS.md
Developer 2: Follow 7_TEMPLATES_INSTRUCTIONS.md + 8_INTERACTIVE_SCRIBE_INSTRUCTIONS.md

Deliverables:
✅ Notes saved to Supabase
✅ Visit history searchable and filterable
✅ Custom templates creatable and saveable
✅ Agentic scribe conversation working
```

### Week 6: Polish & Launch
```
All developers: Testing, optimization, bug fixes

Deliverables:
✅ All unit tests passing (>80% coverage)
✅ WCAG AA accessibility verified
✅ Performance benchmarks met
✅ Security audit passed
✅ Deployed to Vercel
```

---

## 🏗️ Architecture at a Glance

```
Frontend (Next.js)
  Auth Page → Recording Page → Note Editor → History Page
       ↓           ↓              ↓              ↓
   Supabase   Deepgram         Claude      Supabase
    (Auth)  (Transcription)  (Generation)   (Storage)
```

**Technology:**
- Frontend: Next.js 16, React 19, TypeScript 5, Tailwind CSS v4
- Backend: Next.js API Routes
- Database: Supabase PostgreSQL
- AI: Deepgram (transcription) + Claude Opus 4.6 (notes)
- Hosting: Vercel

---

## 🧪 Testing Strategy

### For Each Component
```bash
# Code quality
npm run lint              # ESLint
npm run typecheck         # TypeScript
npm run format            # Prettier (optional)

# Testing
npm test                  # Run all tests
npm test -- --watch      # Watch mode

# Before committing
npm run build             # Ensure build works
```

### Test Coverage Target
- >80% overall
- 100% for critical paths (auth, note generation)

---

## 📚 Documentation Reading Order

**Start here:**
1. This file (QUICK_START.md) - 5 min read
2. SOFTWARE_DESIGN_DOCUMENT.md - 20 min read (skim architecture section)
3. docs/IMPLEMENTATION_ROADMAP.md - 10 min read (understand timeline)

**Before coding your component:**
1. Read your component's INSTRUCTIONS.md file
2. Read CODING_STANDARDS.md (when ready)
3. Read THEME.md (when ready)

**Questions?**
- Architecture questions → SOFTWARE_DESIGN_DOCUMENT.md
- Implementation help → Your component's INSTRUCTIONS.md
- Code standards → CODING_STANDARDS.md (coming)
- Design decisions → THEME.md (coming)

---

## 🚨 Critical Things to Remember

### Security
- **Never commit API keys** - Use .env.local (ignored by git)
- **Encrypt PII** - Patient names, MRNs must be encrypted at rest
- **Supabase RLS** - Enable Row Level Security on all tables
- **HTTPS only** - All API calls must use HTTPS

### Code Quality
- **TypeScript strict mode** - No `any` types
- **Error handling** - Try-catch on all API calls
- **User feedback** - Always show error messages
- **Clean up** - Close WebSocket connections, stop timers

### Data Handling
- **HIPAA compliant** - Audit log all actions
- **Retention policy** - Delete audio after transcription
- **Soft deletes** - Keep deleted data for 90 days (recovery)
- **Encryption** - TweetNaCl.js for PII encryption

---

## 🔄 Git Workflow

### Before Starting
```bash
git fetch origin
git pull origin claude/review-codebase-nh6L5
```

### During Development
```bash
# Create feature branch
git checkout -b feature/auth-signup

# Make commits
git add <files>
git commit -m "feat(auth): implement signup with email/password"

# Push to feature branch
git push origin feature/auth-signup

# Create PR to claude/review-codebase-nh6L5
gh pr create --title "Auth: Email/password signup" --body "..."
```

### Commit Message Format
```
<type>(<component>): <short description>

<optional detailed explanation>

Fixes #<issue_number>
https://claude.ai/code/session_<session_id>
```

Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`

---

## 🎯 Success Checklist for v1

### Feature Complete
- [x] Architecture designed
- [ ] Auth working (signup/login/OAuth)
- [ ] Recording with real-time transcription
- [ ] Note generation from Claude
- [ ] Cloud storage working
- [ ] Visit history searchable
- [ ] Custom templates
- [ ] Agentic scribe MVP

### Code Quality
- [ ] >80% test coverage
- [ ] ESLint passing
- [ ] TypeScript strict mode
- [ ] WCAG AA compliant
- [ ] No critical vulnerabilities

### User Experience
- [ ] Recording → note in < 15 seconds
- [ ] Mobile-responsive design
- [ ] Intuitive UI
- [ ] Helpful error messages
- [ ] Fast page loads

### Deployment
- [ ] Vercel live
- [ ] Error tracking (Sentry)
- [ ] Analytics configured
- [ ] Documentation complete
- [ ] Monitoring set up

---

## 📞 Need Help?

### Common Questions

**Q: Where's the THEME.md file?**
A: It's being researched by a sub-agent. In the meantime, follow Tailwind CSS best practices from the component examples.

**Q: What if I get a Deepgram error?**
A: Check your API key in .env.local. If the key is valid, check the [Deepgram docs](https://developers.deepgram.com/).

**Q: How do I deploy?**
A: Follow docs/IMPLEMENTATION_ROADMAP.md Week 6 section. Vercel handles deployment automatically.

**Q: Can I work on multiple components at once?**
A: Yes, but coordinate with other developers to avoid conflicts. Recommended: 1 dev per component.

**Q: When do we start building?**
A: Now! Start with 1_AUTH_INSTRUCTIONS.md if you're on auth, or 2_RECORDING_INSTRUCTIONS.md if you're on recording.

---

## 🎓 Learning Resources

### Next.js 16
- https://nextjs.org/docs
- https://nextjs.org/learn

### React 19
- https://react.dev

### TypeScript
- https://www.typescriptlang.org/docs

### Supabase
- https://supabase.com/docs
- https://supabase.com/docs/guides/auth

### Deepgram
- https://developers.deepgram.com/docs

### Anthropic Claude
- https://docs.anthropic.com

### Tailwind CSS
- https://tailwindcss.com/docs

---

## ✅ Ready to Start?

1. Clone the repo and install dependencies
2. Set up API keys (.env.local)
3. Pick a component from the priority list
4. Read its INSTRUCTIONS.md file
5. Start coding!

**Good luck! You're building something amazing.** 🚀

---

*Last updated: 2026-02-20*
*Questions? Check the relevant documentation or ask in the project chat.*
