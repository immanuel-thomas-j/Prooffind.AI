# ProofPath AI

> **Prove what you know. Discover what to learn next.**

ProofPath AI is an evidence-based adaptive learning and genuine competence assessment platform for the Generative-AI era.

Generative AI has made it easier to produce code, explanations, projects, and other outputs without necessarily understanding them. Resumes, self-reported skills, GitHub repositories, coding-platform statistics, and certificates provide useful signals, but they do not automatically establish independent competence.

ProofPath AI helps learners identify the difference between:
- **Claimed knowledge** (Self-reported claims, resume bullets)
- **Indirect evidence** (GitHub repositories, coding stats, project descriptions)
- **Demonstrated understanding** (Live explanation, code comprehension)
- **Independent application** (Controlled modification, novel transfer tasks, trade-off defense)

---

## Strict Product Boundaries

1. **Evidence is not automatically proof**:
   - `CLAIMED`: The learner reports having the skill, but supporting evidence has not been evaluated.
   - `INFERRED`: The system infers possible familiarity from indirect evidence (e.g. GitHub repos, commit logs).
   - `VERIFIED`: Evidence has passed a defined verification check with documented limitations.
   - `PROVEN`: Conclusively assigned only when the learner completes a defined multi-stage assessment with novel transfer problems.
2. **No unreliable AI-authorship detection**: We do not claim that statistical heuristics can reliably detect AI-generated code. Instead, we evaluate understanding interactively through concept explanation, bug repairs, and unpracticed transfer challenges.
3. **No psychological diagnoses (No "Dunning–Kruger")**: When a learner's claims exceed their verified evidence, we identify a **Skill-Evidence Discrepancy** with constructive, targeted calibration challenges.
4. **Honest uncertainty communication**: Every report explains what was assessed, what conditions applied (AI-allowed vs restricted), what the result supports, and what it does not establish.

---

## Layered Clean Architecture

ProofPath AI is designed with clean separation of concerns so that **Supabase** can be integrated without rewriting the frontend, business logic, or data models:

```
UI Components (Next.js App Router)
       ↓
Application Services / Graph Engine / Rubric Engine / Socratic Mentor
       ↓
Repository Interfaces (ILearnerRepository, IEvidenceRepository, etc.)
       ↓
Current Local Data Provider (Browser LocalStorage + SSR In-Memory Store)
       ↓ (Ready for future plug-and-play swap)
Future Supabase Data Provider (PostgreSQL + RLS + Supabase Auth)
```

The schema and RLS policies are pre-written in [`supabase/schema.sql`](supabase/schema.sql).

---

## MVP User Journey

1. **Landing Page (`/`)**: Core problem breakdown, evidence vs proof explanation, evidence signal reality matrix.
2. **Onboarding (`/onboarding`)**: Learner profile creation, learning goals, claimed skills, skippable external profile links, demo preset auto-fill.
3. **Learner Dashboard (`/dashboard`)**: Evidence breakdown (Claimed, Inferred, Verified, Proven), Skill-Evidence Discrepancy alerts, and quick actions.
4. **Skill Graph & DAG (`/skills`)**: Modular Directed Acyclic Graph (DAG) viewer and accessible list view with verified acyclic topological ordering.
5. **Evidence Vault (`/evidence`)**: Audit log of all claims with documented reliability limitations, manual entry modal, and signal reference table.
6. **Assessment Workspace (`/assessment` & `/assessment/[id]`)**: 4 interactive stages:
   - Stage 1: Concept Explanation (evaluated via rubric)
   - Stage 2: Controlled Code Modification (starter code bug diagnosis and repair)
   - Stage 3: Novel Transfer Task (different context synthesis)
   - Stage 4: Follow-up Reasoning Questions (trade-off defense)
   - AI Usage Disclosure modal on submission
7. **Assessment Report (`/assessment/report/[attemptId]`)**: Criterion-by-criterion scores, strengths, knowledge gaps, uncertainty notes, and evidence vault status update (`PROVEN` / `VERIFIED`).
8. **Adaptive Learning Path (`/path`)**: DAG prerequisite-sequenced milestones and real-world system engineering projects with documented difficulty heuristics.
9. **Nexus AI Mentor (`/mentor`)**: Socratic AI mentor with 5 distinct modes (`LEARNING`, `PRACTICE`, `ASSESSMENT_PREP`, `ASSESSMENT`, `REFLECTION`) and structured guardrails.
10. **Transparency & Ethics (`/transparency`)**: Full methodology documentation, evidence matrix, and Supabase integration specification.

---

## Local Development & Testing

### Prerequisites
- Node.js 18+ (tested on Node v24.11.0)
- npm 9+

### Commands
```bash
# Install dependencies
npm install

# Run Vitest test suite (unit + integration tests)
npm test

# Run Next.js development server
npm run dev

# Run production build
npm run build
```

---

## Demo Mode Walkthrough

ProofPath AI includes a complete demo mode pre-seeded with fictional learner data for **Alex Rivera**:
1. Navigate to `/dashboard` to explore Alex's profile, claimed skills, and an active **Skill-Evidence Discrepancy** on Hash Tables.
2. Click **Start Calibration** or navigate to `/assessment/assess-hash-01`.
3. In the assessment workspace, click **Load Sample Learner Answers** to populate the 4 stages with technical explanations and bug fixes.
4. Click **Submit Evaluation**, fill out the AI Disclosure, and inspect the resulting **Assessment Report**.
5. Observe how the Evidence Vault and Skill Matrix update in real-time to **PROVEN** status.
6. Click **Reset Demo** in the top banner or navbar anytime to restore initial state.
