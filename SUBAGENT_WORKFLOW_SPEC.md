# ENT Scribe - Sub-Agent Workflow Specification

**Purpose:** Define how automated Code Review and UI Testing sub-agents work as CI/CD gates

**Status:** Ready for implementation
**Target:** Runs after every commit on both branches

---

## Overview: Two Sub-Agents Working Together

```
Git Commit on Feature Branch
    ↓
    ├─→ Sub-Agent 1: CODE REVIEW
    │   ├─ Run linting/formatting
    │   ├─ Check security
    │   ├─ Verify CODING_STANDARDS.md compliance
    │   ├─ Cross-check docs/IMPLEMENTATION_ROADMAP.md
    │   └─ Auto-fix + commit if fixable
    │
    ├─→ Sub-Agent 2: UI TESTING (Frontend only)
    │   ├─ Run component tests
    │   ├─ Take screenshots
    │   ├─ Check responsive design
    │   ├─ Verify THEME.md compliance
    │   └─ Audit accessibility
    │
    ↓
    Both agents report PASS/FAIL
    ↓
    If PASS → Feature branch ready for integration
    If FAIL → Auto-fixes applied, new commit made

```

---

## Sub-Agent 1: Code Review Agent

### Trigger
**When:** After every commit to both branches
**Who:** Backend and Frontend teams
**Where:** Runs in GitHub Actions or Claude Code environment

### Responsibilities

#### 1.1 Code Quality Checks
**ESLint & Formatting:**
- [ ] Run ESLint (check CODING_STANDARDS.md for rules)
- [ ] Run Prettier (auto-format)
- [ ] Check for unused variables/imports
- [ ] Verify TypeScript strict mode

**Command:**
```bash
eslint . --ext .ts,.tsx
prettier --check .
```

**Output:** Report of all formatting issues

---

#### 1.2 Security Scanning
**Check for secrets/hardcoded credentials:**
- [ ] No API keys in code (OPENAI_API_KEY, etc)
- [ ] No passwords in strings
- [ ] No hardcoded URLs (use env vars)
- [ ] No console.log of sensitive data
- [ ] No localStorage.setItem() of PII

**Patterns to catch:**
```javascript
// ❌ BAD - will fail review
const apiKey = "sk-abc123def456"
const url = "https://api.example.com"

// ✅ GOOD - will pass review
const apiKey = process.env.OPENAI_API_KEY
const url = process.env.NEXT_PUBLIC_API_URL
```

**Tool:** Use `git-secrets` or `trivy`
```bash
git secrets --scan
trivy fs . --severity HIGH,CRITICAL
```

---

#### 1.3 HIPAA/SECURITY Compliance
**Check for HIPAA violations:**
- [ ] No unencrypted PII in database
- [ ] No patient data in logs
- [ ] No unencrypted transmission (HTTPS enforced)
- [ ] Rate limiting on API routes
- [ ] Input validation present

**Checklist against CODING_STANDARDS.md:**
```
CODING_STANDARDS.md Section: Security
  ✓ API routes validate input
  ✓ PII encrypted at rest
  ✓ No PII in logs
  ✓ Rate limiting on routes
  ✓ CORS headers correct
```

---

#### 1.4 Code Standards Verification
**Cross-reference CODING_STANDARDS.md:**
- [ ] File naming conventions (camelCase for files, PascalCase for components)
- [ ] Component structure matches standard
- [ ] Error handling present (try-catch or error boundary)
- [ ] Type annotations used (no `any` types)
- [ ] Proper use of React hooks (rules of hooks)
- [ ] API routes follow response format standard

**Example TypeScript check:**
```typescript
// ❌ BAD - will fail
const fetchData = async () => {
  const response = await fetch(url)
  return response.json()
}

// ✅ GOOD - will pass
const fetchData = async () => {
  try {
    const response = await fetch(url)
    if (!response.ok) throw new Error('API failed')
    return await response.json()
  } catch (error) {
    console.error('Fetch error:', error)
    throw error
  }
}
```

---

#### 1.5 Checkpoint Verification (Backend)
**For backend commits, verify:**
- [ ] API routes match docs/IMPLEMENTATION_ROADMAP.md
- [ ] Database changes match schema
- [ ] Error responses include proper status codes
- [ ] Response format matches spec

**Example API check:**
```typescript
// Checkpoint 1.1: Auth Routes
// Expected response format from docs/IMPLEMENTATION_ROADMAP.md
{
  "success": boolean,
  "data": { user: {...} },
  "error": "string or null"
}

// Code Review Agent verifies this structure is present
```

---

#### 1.6 Auto-Fix & Commit
**If issues found, agent:**
1. Auto-fixes formatting (ESLint --fix, Prettier)
2. Creates new commit: `fix: auto-fixed formatting and standards`
3. Reports: "❌ Found X issues, auto-fixed Y, see commit abc123"

**If unfixable:**
1. Reports: "❌ Manual fix required: [issue]"
2. Blocks merge (developer must fix manually)

---

### Code Review Agent Output

**Success case:**
```
✅ CODE REVIEW PASSED
- ESLint: 0 errors, 0 warnings
- Security: No secrets found
- HIPAA: All checks passed
- Standards: TypeScript strict ✓
- Checkpoint: Matches docs/IMPLEMENTATION_ROADMAP.md
```

**Failure case:**
```
❌ CODE REVIEW FAILED
- Security Issue: Found hardcoded API key in /lib/api.ts:45
  Fix: Use process.env.OPENAI_API_KEY instead
- Type Issue: Variable 'user' has type 'any'
  Fix: Add type annotation

Action: Manual fixes required. Cannot auto-fix.
```

---

## Sub-Agent 2: UI Testing Agent

### Trigger
**When:** After every commit to FRONTEND branch only
**Who:** Frontend team
**Where:** Runs in GitHub Actions or Claude Code environment

### Responsibilities

#### 2.1 Component Testing
**Run tests for modified components:**
- [ ] Storybook snapshot tests
- [ ] React Testing Library tests
- [ ] Responsive design tests
- [ ] Accessibility tests

**Command:**
```bash
npm run test -- --changed-files
npm run storybook:test
```

---

#### 2.2 Screenshot & Visual Regression
**Take screenshots of modified components:**
- [ ] Desktop (1920x1080)
- [ ] Tablet (768x1024)
- [ ] Mobile (375x667)
- [ ] Dark mode variants

**Compare to previous version:**
- [ ] Check for unintended visual changes
- [ ] Verify theme colors applied (THEME.md)
- [ ] Check button states (hover, active, disabled)

**Storage:**
```
/screenshots/
  ├─ auth-signup-desktop-light.png
  ├─ auth-signup-desktop-dark.png
  ├─ auth-signup-tablet.png
  ├─ auth-signup-mobile.png
  └─ COMPARISON_REPORT.md
```

**Tool:** Use Playwright or Puppeteer
```bash
npx playwright codegen http://localhost:3000
npx playwright screenshot ./app/auth/page.tsx
```

---

#### 2.3 Responsive Design Verification
**Verify across breakpoints:**
- [ ] Mobile: 375px (iPhone SE)
- [ ] Tablet: 768px (iPad)
- [ ] Desktop: 1920px (full width)
- [ ] Extra wide: 2560px

**Checks:**
- [ ] No horizontal scrolling
- [ ] Touch targets ≥ 44x44px (mobile)
- [ ] Text readable (font size ≥ 16px mobile)
- [ ] Images responsive (no fixed widths)

**Example checks:**
```typescript
// Verify button is 44px minimum for mobile
const button = screen.getByRole('button', { name: /record/i })
expect(button).toHaveStyle({ minHeight: '44px', minWidth: '44px' })

// Verify no horizontal scroll on mobile
expect(window.innerWidth).toBeLessThanOrEqual(375)
```

---

#### 2.4 Accessibility (WCAG AA) Verification
**Run axe accessibility scanner:**
- [ ] No color contrast violations
- [ ] All images have alt text
- [ ] Form labels associated
- [ ] Headings in order (h1 → h2 → h3)
- [ ] Interactive elements keyboard accessible
- [ ] ARIA labels present

**Tool:** Use axe-core
```bash
npm run a11y:test
```

**Checks:**
```typescript
// Example accessibility test
test('Recording button is keyboard accessible', () => {
  const button = screen.getByRole('button', { name: /record/i })
  button.focus()
  expect(document.activeElement).toBe(button)

  // Verify focus outline visible
  expect(button).toHaveStyle('outline: 2px solid')
})
```

---

#### 2.5 Theme.md Compliance
**Verify design matches THEME.md:**
- [ ] Primary color used (Teal #0891B2)
- [ ] Glassmorphism effects applied to cards
- [ ] Font families match (Serif headers, Sans body)
- [ ] Spacing follows scale (8px, 16px, 24px, etc)
- [ ] Dark mode colors correct
- [ ] Animations smooth (60fps)

**Checks:**
```typescript
// Verify teal primary button color
const button = screen.getByRole('button', { name: /record/i })
const styles = window.getComputedStyle(button)
expect(styles.backgroundColor).toBe('rgb(6, 182, 212)') // #0891B2 in RGB
```

---

#### 2.6 Performance Checks
**Lighthouse audit for page:**
- [ ] Performance ≥ 85
- [ ] Accessibility ≥ 95
- [ ] Best Practices ≥ 90
- [ ] SEO ≥ 90

**Command:**
```bash
npm run lighthouse
```

---

### UI Testing Agent Output

**Success case:**
```
✅ UI TESTING PASSED
- Component Tests: All passed (12/12)
- Responsive Design: ✓ Mobile, tablet, desktop verified
- Accessibility: 0 WCAG AA violations
- Theme Compliance: ✓ Teal primary color, glass effects applied
- Performance: Lighthouse 92
- Screenshots saved: /screenshots/[component]-*

Modified components:
  ✓ RecordButton.tsx
  ✓ NoteEditor.tsx
  ✓ History page
```

**Failure case:**
```
❌ UI TESTING FAILED
- Accessibility: Color contrast issue on RecordButton
  Problem: Gray text (#777) on light gray bg (#f0f0f0) = 2.1:1
  Needs: Minimum 4.5:1 for normal text
  Fix: Use darker text color or lighter background

- Responsive: Button text overflows on mobile (375px)
  Problem: "Start Recording" wraps to 2 lines
  Fix: Reduce button padding or use smaller font on mobile

- Theme: Missing glass effect on NoteEditor card
  Expected: backdrop-filter: blur(10px); opacity: 0.8
  Found: No backdrop-filter present

Action: Fix issues and re-run tests
```

---

## Combined Sub-Agent Workflow Example

### Scenario: Frontend developer commits Recording UI

**Step 1: Developer commits**
```bash
git add app/record/page.tsx components/RecordButton.tsx
git commit -m "feat: add recording UI with pause/resume"
```

**Step 2: Code Review Agent runs (5 min)**
```
✓ ESLint check: PASS
✓ TypeScript check: PASS (no 'any' types)
✓ Security: PASS (no API keys found)
✓ HIPAA: PASS (no PII in logs)
✓ Standards: PASS (error handling present)
→ Result: ✅ CODE REVIEW PASSED
```

**Step 3: UI Testing Agent runs (10 min)**
```
✓ Component tests: 8/8 passed
✓ Responsive: ✓ Mobile, ✓ Tablet, ✓ Desktop
✓ Accessibility: WCAG AA passed (0 violations)
✓ Theme: ✓ Teal colors, ✓ Glass effects
✓ Lighthouse: 88/100
✓ Screenshots taken: /screenshots/RecordButton-*.png
→ Result: ✅ UI TESTING PASSED
```

**Step 4: Both agents report**
```
✅ ALL CHECKS PASSED
Feature ready for integration with backend
Screenshots: https://github.com/.../screenshots
```

**Step 5: Developer can now:**
- Merge to integration branch
- Test with backend team
- Schedule for production deployment

---

## Sub-Agent Implementation (How to Set Up)

### Option 1: GitHub Actions (Automated)
Create `.github/workflows/code-review.yml`:
```yaml
name: Code Review
on: [push, pull_request]
jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm install
      - run: npm run lint
      - run: npm run test
      - run: npm run a11y:test  # frontend only
      - run: npx playwright screenshot # frontend only
```

### Option 2: Claude Code Built-in (Manual but Intelligent)
- After each commit, I (Claude Code) can:
  1. Read changed files
  2. Run checks using Bash commands
  3. Report results
  4. Auto-fix and commit if possible
  5. Post results as comment

### Option 3: Hybrid (Recommended)
- GitHub Actions for automated checks (fast)
- Claude Code for intelligent review + auto-fixes
- Both work together

---

## What Blocks a Merge?

### Critical Blocks (Manual Fix Required)
- ❌ Security issues (API keys, secrets)
- ❌ HIPAA violations (PII in logs)
- ❌ TypeScript compilation errors
- ❌ Failed unit tests
- ❌ Critical accessibility violations (color contrast)

### Warnings (Can Override but Not Recommended)
- ⚠️ ESLint warnings (auto-fixed)
- ⚠️ Formatting issues (auto-fixed)
- ⚠️ Performance Lighthouse < 80

---

## Frequency & Performance

**How often do these run?**
- After every commit: ~2-5 min execution time
- Before integration: ~10 min execution time
- Before production: ~30 min full suite

**Total development overhead:**
- Code Review: ~1-2 min per commit (mostly automated)
- UI Testing: ~3-5 min per commit (frontend only)
- **Total: ~5-7 min per commit for peace of mind**

---

## Escalation Path

**If agent can't fix:**
1. Agent posts detailed report with:
   - Issue description
   - Line number in file
   - Suggested fix
   - Reference to CODING_STANDARDS.md
2. Developer reads report
3. Developer manually fixes
4. Developer commits fix
5. Agent re-runs and confirms

**Example escalation:**
```
❌ MANUAL FIX REQUIRED
File: /app/api/generate/route.ts:42
Issue: Function 'generateNote' has type 'any'
Standard: Section 5.2 - Use explicit types, never 'any'
Fix: Change:
  async function generateNote(transcript: any) {
To:
  async function generateNote(transcript: string, options: GenerateOptions) {

Reference: https://link-to-standards-doc
```

---

## Dashboard & Reporting

**After each checkpoint, show:**
```
╔════════════════════════════════════════╗
║  CHECKPOINT 1.3: Recording Interface   ║
╠════════════════════════════════════════╣
║  Status: ✅ COMPLETE & READY           ║
║                                        ║
║  Code Review Agent:                    ║
║  ├─ Commits reviewed: 12               ║
║  ├─ Auto-fixes applied: 3              ║
║  ├─ Manual fixes: 0                    ║
║  └─ Final status: ✅ PASS              ║
║                                        ║
║  UI Testing Agent:                     ║
║  ├─ Components tested: 3               ║
║  ├─ Responsive verified: ✅            ║
║  ├─ A11y violations: 0                 ║
║  ├─ Lighthouse: 91/100                 ║
║  └─ Final status: ✅ PASS              ║
║                                        ║
║  Integration Status:                   ║
║  └─ Ready for backend integration ✅   ║
╚════════════════════════════════════════╝
```

---

**These sub-agents ensure every checkpoint is production-ready before moving forward!**
