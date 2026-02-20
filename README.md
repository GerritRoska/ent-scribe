# ENT Scribe

An open-source ambient AI medical scribe built specifically for ENT (Ear, Nose & Throat) physicians. Record a patient visit, get a structured clinical note — ready to paste into your EHR.

**Live demo → [ent-scribe.vercel.app](https://ent-scribe.vercel.app)**

---

## Product Overview

ENT Scribe is more than a demo — it is a fully specified, production-ready blueprint for an ambient scribing platform. The `docs/` directory captures everything needed to ship v1:

- `docs/INDEX.md` provides a guided reading order so new contributors can become productive in minutes.
- `docs/IMPLEMENTATION_ROADMAP.md` breaks delivery into a six-week plan with component dependencies and QA checklists.
- `docs/THEME.md` defines the glassmorphism-inspired design system, accessibility targets, and Tailwind implementation details.
- `docs/SOFTWARE_DESIGN_DOCUMENT.md` and the implementation instructions outline the Deepgram streaming stack, Supabase auth/storage, and Claude-powered note generation.

Together these artifacts turn the repo into a plug-and-build kit: clone it, follow the Quick Start, and you have a clear path from local dev to production deployment.

## Future Vision

The long-term roadmap (see `docs/PHASE2_DESIGN_DOCUMENT.md`) frames ENT Scribe as the **Jarvis for clinical documentation** — an assistant that not only listens and drafts notes, but also understands physician preferences, surfaces ICD-10 gaps, and plugs into major EHRs (Epic, Cerner, eClinicalWorks) through FHIR/HL7 integrations. Phase 2 focuses on adaptive AI copilots, secure data fine-tuning, and compliance automation so ENT teams can trust the system with their entire documentation workflow.

---

## What it does

1. **Select a visit type** — choose from built-in ENT templates (New Patient, Sinus/Rhinitis, Hearing Evaluation, Nasal Endoscopy, Post-Op) or create your own.
2. **Record the visit** — press Start and speak naturally. Audio is chunked and transcribed in near real time.
3. **Get a structured note** — GPT-4o fills in the template using only what was said. Nothing is inferred or fabricated.
4. **Copy to EHR** — review, edit, and paste directly into eClinicalWorks or any EHR.

---

## Built-in templates

| Template | Use case |
|---|---|
| New Patient ENT | Full H&P with HPI, PMH, exam, assessment & plan |
| Sinus / Rhinitis | Focused nasal/sinus visit |
| Hearing Evaluation | Includes audiogram fields, Weber/Rinne |
| Nasal Endoscopy | Procedure note with bilateral findings |
| Post-Op Check | Post-surgical follow-up |

Custom templates can be created and managed from the Templates page — stored locally in your browser.

---

## Tech stack

- **Next.js 16** (App Router) + TypeScript
- **Tailwind CSS v4**
- **Deepgram API** — speech-to-text (default, configurable)
- **OpenAI API** — GPT-4o for note generation (and optional transcription fallback)
- Deployed on **Vercel**

---

## Getting started

### Prerequisites

- Node.js 18+
- A [Deepgram API key](https://console.deepgram.com/project)
- An [OpenAI API key](https://platform.openai.com/api-keys)

### Setup

```bash
git clone https://github.com/GerritRoska/ent-scribe.git
cd ent-scribe
npm install
```

Create a `.env.local` file:

```
TRANSCRIPTION_PROVIDER=deepgram
DEEPGRAM_API_KEY=dg_...
DEEPGRAM_MODEL=nova-3-medical
OPENAI_API_KEY=sk-...
```

Optional fallback:

```
# Set to "openai" to use OpenAI transcription instead of Deepgram
TRANSCRIPTION_PROVIDER=openai
OPENAI_TRANSCRIPTION_MODEL=whisper-1
```

Run the dev server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deployment

Deploy instantly with Vercel:

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/GerritRoska/ent-scribe)

Set these Vercel environment variables:
- `TRANSCRIPTION_PROVIDER`
- `DEEPGRAM_API_KEY`
- `DEEPGRAM_MODEL`
- `OPENAI_API_KEY`
- `OPENAI_TRANSCRIPTION_MODEL` (optional)

---

## Privacy & disclaimer

- Audio is sent to the configured transcription provider (Deepgram by default, OpenAI optional). Review provider data policies before clinical use.
- OpenAI API data policy: [OpenAI API data usage policies](https://openai.com/policies/api-data-usage-policies)
- Deepgram security/privacy docs: [Deepgram security and trust center](https://deepgram.com/trust-center)
- This tool is intended to assist documentation — **always review notes before adding to a patient record.**
- Not a substitute for clinical judgment.

---

## Contributing

Pull requests welcome. To add a new default template, edit `lib/templates.ts`.

## License

MIT
