-- ==============================================================================
-- Solvix Competence Assessment Engine — Complete PostgreSQL / Supabase Schema
-- Run this entire script in the Supabase SQL Editor (https://supabase.com/dashboard/project/ohmqnuoxtjuhxbqighyq/sql)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'learner' CHECK (role IN ('learner', 'evaluator', 'admin')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. LEARNER PROFILES
CREATE TABLE IF NOT EXISTS public.learner_profiles (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    learning_goal TEXT NOT NULL,
    target_role TEXT NOT NULL,
    experience_level TEXT NOT NULL CHECK (experience_level IN ('Beginner', 'Intermediate', 'Advanced')),
    programming_languages TEXT[] NOT NULL DEFAULT '{}',
    self_reported_skills TEXT[] NOT NULL DEFAULT '{}',
    github_url TEXT,
    coding_profile_url TEXT,
    preferred_learning_hours_per_week INT NOT NULL DEFAULT 8,
    ai_assistance_preference TEXT NOT NULL DEFAULT 'balanced' CHECK (ai_assistance_preference IN ('proactive', 'balanced', 'minimal')),
    is_demo_user BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. SKILLS & PREREQUISITES GRAPH (DAG)
CREATE TABLE IF NOT EXISTS public.skills (
    id TEXT PRIMARY KEY,
    slug TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('Computer Science', 'Backend Engineering', 'Frontend Engineering', 'Distributed Systems', 'DevOps & Security')),
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Fundamental', 'Intermediate', 'Advanced')),
    description TEXT NOT NULL,
    core_concepts TEXT[] NOT NULL DEFAULT '{}',
    evaluation_focus TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.skill_prerequisites (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    prerequisite_skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    relation_type TEXT NOT NULL CHECK (relation_type IN ('STRICT_PREREQUISITE', 'RECOMMENDED_BACKGROUND')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT unique_skill_prereq_edge UNIQUE (skill_id, prerequisite_skill_id),
    CONSTRAINT prevent_self_prereq CHECK (skill_id <> prerequisite_skill_id)
);

-- 4. EVIDENCE VAULT
CREATE TABLE IF NOT EXISTS public.evidence_items (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN (
        'SELF_REPORTED', 'RESUME_CLAIM', 'GITHUB_REPOSITORY',
        'CODING_PLATFORM_PROFILE', 'PROJECT_DESCRIPTION', 'EXPLANATION_RESPONSE',
        'ASSESSMENT_RESULT', 'CONTROLLED_MODIFICATION_TASK', 'TRANSFER_TASK_RESULT'
    )),
    category TEXT NOT NULL CHECK (category IN ('CLAIMED', 'INFERRED', 'VERIFIED', 'PROVEN')),
    title TEXT NOT NULL,
    source TEXT NOT NULL,
    date_collected TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reliability_limitations TEXT NOT NULL,
    directly_assessed BOOLEAN NOT NULL DEFAULT FALSE,
    ai_assistance_allowed BOOLEAN NOT NULL DEFAULT TRUE,
    ai_disclosure_details TEXT,
    notes TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. ASSESSMENTS, ATTEMPTS & RESULTS
CREATE TABLE IF NOT EXISTS public.assessments (
    id TEXT PRIMARY KEY,
    skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    version TEXT NOT NULL DEFAULT '1.0.0',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    time_limit_minutes INT NOT NULL DEFAULT 30,
    allowed_conditions TEXT NOT NULL CHECK (allowed_conditions IN (
        'AI_ALLOWED', 'AI_RESTRICTED', 'AI_DISCLOSURE_REQUIRED', 'PRACTICE_MODE'
    )),
    stages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_attempts (
    id TEXT PRIMARY KEY,
    assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'IN_PROGRESS' CHECK (status IN ('IN_PROGRESS', 'SUBMITTED', 'EVALUATED')),
    conditions_applied TEXT NOT NULL,
    ai_disclosure JSONB NOT NULL DEFAULT '{"usedAI": false}'::jsonb,
    stage_responses JSONB NOT NULL DEFAULT '[]'::jsonb,
    started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.assessment_results (
    id TEXT PRIMARY KEY,
    attempt_id TEXT NOT NULL UNIQUE REFERENCES public.assessment_attempts(id) ON DELETE CASCADE,
    assessment_id TEXT NOT NULL REFERENCES public.assessments(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    skill_id TEXT NOT NULL REFERENCES public.skills(id) ON DELETE CASCADE,
    competence_status TEXT NOT NULL CHECK (competence_status IN (
        'NOT_ASSESSED', 'INITIAL_EVIDENCE', 'PARTIALLY_DEMONSTRATED',
        'DEMONSTRATED_IN_ASSESSED_CONTEXT', 'REQUIRES_TRANSFER_VALIDATION'
    )),
    percentage_score INT NOT NULL CHECK (percentage_score BETWEEN 0 AND 100),
    rubric_evaluations JSONB NOT NULL DEFAULT '[]'::jsonb,
    strengths TEXT[] NOT NULL DEFAULT '{}',
    knowledge_gaps TEXT[] NOT NULL DEFAULT '{}',
    uncertainty_notes TEXT NOT NULL,
    what_result_supports TEXT NOT NULL,
    what_result_does_not_establish TEXT NOT NULL,
    recommended_next_assessment TEXT NOT NULL,
    recommended_learning_activity TEXT NOT NULL,
    evaluated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. LEARNING PATHS & REAL-WORLD PROJECTS
CREATE TABLE IF NOT EXISTS public.learning_paths (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    target_role TEXT NOT NULL,
    generated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduling_heuristic_explanation TEXT NOT NULL,
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    target_role TEXT NOT NULL,
    required_skills TEXT[] NOT NULL DEFAULT '{}',
    prerequisites TEXT[] NOT NULL DEFAULT '{}',
    difficulty TEXT NOT NULL CHECK (difficulty IN ('Accessible', 'Challenging', 'Advanced')),
    difficulty_heuristic_note TEXT NOT NULL,
    learning_outcomes TEXT[] NOT NULL DEFAULT '{}',
    milestones JSONB NOT NULL DEFAULT '[]'::jsonb,
    assessment_method TEXT NOT NULL,
    ai_assistance_rules TEXT NOT NULL,
    extension_challenges TEXT[] NOT NULL DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 7. NEXUS SOCRATIC MENTOR CONVERSATIONS
CREATE TABLE IF NOT EXISTS public.mentor_conversations (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    mode TEXT NOT NULL CHECK (mode IN ('LEARNING', 'PRACTICE', 'ASSESSMENT_PREP', 'ASSESSMENT', 'REFLECTION')),
    topic_skill_id TEXT REFERENCES public.skills(id) ON DELETE SET NULL,
    messages JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) & PUBLIC ANON ACCESS POLICIES
-- Enable full read/write for live client interaction via Anon Key
-- ==============================================================================

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learner_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assessment_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.learning_paths ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mentor_conversations ENABLE ROW LEVEL SECURITY;

-- Create Permissive Anon Policies (Drop existing if re-running)
DROP POLICY IF EXISTS "Public users access" ON public.users;
CREATE POLICY "Public users access" ON public.users FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public learner profiles access" ON public.learner_profiles;
CREATE POLICY "Public learner profiles access" ON public.learner_profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public skills access" ON public.skills;
CREATE POLICY "Public skills access" ON public.skills FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public prerequisites access" ON public.skill_prerequisites;
CREATE POLICY "Public prerequisites access" ON public.skill_prerequisites FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public evidence access" ON public.evidence_items;
CREATE POLICY "Public evidence access" ON public.evidence_items FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public assessments access" ON public.assessments;
CREATE POLICY "Public assessments access" ON public.assessments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public assessment attempts access" ON public.assessment_attempts;
CREATE POLICY "Public assessment attempts access" ON public.assessment_attempts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public assessment results access" ON public.assessment_results;
CREATE POLICY "Public assessment results access" ON public.assessment_results FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public learning paths access" ON public.learning_paths;
CREATE POLICY "Public learning paths access" ON public.learning_paths FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public projects access" ON public.projects;
CREATE POLICY "Public projects access" ON public.projects FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public mentor conversations access" ON public.mentor_conversations;
CREATE POLICY "Public mentor conversations access" ON public.mentor_conversations FOR ALL USING (true) WITH CHECK (true);

-- ==============================================================================
-- INITIAL SEED DATA INSERTION (Immanuel Thomas J & Core Catalog)
-- ==============================================================================

-- 1. Initial Candidate User & Profile
INSERT INTO public.users (id, email, name, role)
VALUES ('demo-learner-immanuel-001', 'immanuel.thomas@solvix.ai', 'Immanuel Thomas J', 'learner')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

INSERT INTO public.learner_profiles (
    id, user_id, name, learning_goal, target_role, experience_level,
    programming_languages, self_reported_skills, github_url, coding_profile_url,
    preferred_learning_hours_per_week, ai_assistance_preference, is_demo_user
) VALUES (
    'profile-immanuel-001',
    'demo-learner-immanuel-001',
    'Immanuel Thomas J',
    'Validate genuine AI systems architecture, data structure invariants, and open-source tooling competencies.',
    'Software Engineer & AI Architect',
    'Advanced',
    ARRAY['JavaScript', 'TypeScript', 'Python', 'Go', 'HTML/CSS'],
    ARRAY['Hash Tables & Collision Resolution', 'Concurrency, Mutexes & Race Conditions', 'AI Systems Architecture & Prompt Crafts', 'Open Source Tooling (OpenForge)', 'Distributed Caching & Invalidation'],
    'https://github.com/immanuel-thomas-j',
    'https://leetcode.com/u/immanuel-thomas-j/',
    12,
    'balanced',
    false
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    learning_goal = EXCLUDED.learning_goal,
    target_role = EXCLUDED.target_role,
    experience_level = EXCLUDED.experience_level;

-- 2. Initial Skills Catalog
INSERT INTO public.skills (id, slug, name, category, difficulty, description, core_concepts, evaluation_focus) VALUES
('skill-ds-01', 'data-structures-core', 'Core Data Structures & Memory Layouts', 'Computer Science', 'Fundamental', 'Memory representation of arrays, linked lists, dynamic allocation, pointer traversals, and amortized complexity bounds.', ARRAY['Contiguous vs node-based memory', 'Cache locality', 'Amortized resizing', 'Pointer arithmetic'], 'Memory complexity trade-offs and cache efficiency in production systems.'),
('skill-hash-02', 'hash-tables-collisions', 'Hash Tables & Collision Resolution', 'Computer Science', 'Intermediate', 'Hash functions, load factor thresholds, open addressing vs separate chaining, worst-case O(N) degradation, and DoS resilience.', ARRAY['Universal hashing', 'Load factors', 'Linear probing vs chaining', 'Collision degradation', 'HashDoS'], 'Ability to explain degradation modes and implement collision-safe dynamic structures under constraints.'),
('skill-concurrency-03', 'concurrency-race-conditions', 'Concurrency, Mutexes & Race Conditions', 'Backend Engineering', 'Advanced', 'Thread synchronization, data races, deadlocks, atomic operations, re-entrant locks, and lock-free concurrency primitives.', ARRAY['Mutex vs ReadWriteLock', 'Data race vs race condition', 'Deadlock conditions', 'Memory barriers', 'Channel synchronization'], 'Detecting and refactoring subtle synchronization bugs and race conditions in concurrent request pipelines.'),
('skill-cache-04', 'distributed-caching', 'Distributed Caching & Invalidation', 'Distributed Systems', 'Advanced', 'Cache patterns (cache-aside, write-through), cache stamps, thundering herd problem, TTL decay, and consensus-driven invalidation.', ARRAY['Cache-aside pattern', 'Thundering herd mitigation', 'Probabilistic early expiration', 'Two-phase invalidation'], 'Designing fault-tolerant cache layers capable of surviving high-concurrency node restarts.'),
('skill-api-05', 'rest-microservices', 'REST API Contracts & Idempotency', 'Backend Engineering', 'Intermediate', 'Contract-first API design, idempotent mutations, status code semantics, structured error envelopes, and backwards compatibility.', ARRAY['Idempotency keys', 'Content negotiation', 'HATEOAS vs pragmatic REST', 'Versioning strategies'], 'Designing bulletproof payment and mutation endpoints with idempotent retries.'),
('skill-db-06', 'db-indexing-opt', 'Database Indexing & Query Execution Plans', 'Backend Engineering', 'Intermediate', 'B-Tree vs Hash indexes, composite index column order, table scans, join algorithms, and execution plan cost estimation.', ARRAY['B-Tree branching factor', 'Covering indexes', 'Index selectivity', 'EXPLAIN ANALYZE interpretation'], 'Optimizing high-latency multi-join queries through index redesign rather than hardware scaling.')
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Prerequisites DAG
INSERT INTO public.skill_prerequisites (id, skill_id, prerequisite_skill_id, relation_type) VALUES
('pre-1', 'skill-hash-02', 'skill-ds-01', 'STRICT_PREREQUISITE'),
('pre-2', 'skill-cache-04', 'skill-hash-02', 'STRICT_PREREQUISITE'),
('pre-3', 'skill-cache-04', 'skill-concurrency-03', 'RECOMMENDED_BACKGROUND'),
('pre-4', 'skill-cache-04', 'skill-api-05', 'RECOMMENDED_BACKGROUND')
ON CONFLICT (id) DO NOTHING;

-- 4. Initial Evidence Vault Items
INSERT INTO public.evidence_items (
    id, user_id, skill_id, type, category, title, source,
    reliability_limitations, directly_assessed, ai_assistance_allowed, notes
) VALUES
('ev-01', 'demo-learner-immanuel-001', 'skill-ds-01', 'ASSESSMENT_RESULT', 'VERIFIED', 'Core Data Structures Diagnostic Evaluation', 'ProofPath Diagnostic Lab v1.2', 'Evaluated under open-notes, timed proctored environment. Covers standard array vs linked list mechanics; does not assess custom OS-level allocators.', true, false, 'Demonstrated accurate Big-O analysis and memory pointer arithmetic.'),
('ev-02', 'demo-learner-immanuel-001', 'skill-hash-02', 'GITHUB_REPOSITORY', 'INFERRED', 'Public Repository: openforge', 'https://github.com/immanuel-thomas-j/openforge', 'Repository contains clean open-source code, but commits require direct explanation and controlled assessment.', false, true, 'Indirect evidence of systems architecture familiarity.'),
('ev-03', 'demo-learner-immanuel-001', 'skill-concurrency-03', 'RESUME_CLAIM', 'CLAIMED', 'Resume Claim: Designed lock-free concurrent ingestion pipeline', 'Uploaded Resume (2026 Software Engineer profile)', 'Self-reported claim on resume. No reproducible code sample or controlled debugging assessment provided yet.', false, true, 'Significant skill-evidence discrepancy: High claim with zero direct evaluation.')
ON CONFLICT (id) DO NOTHING;

-- 5. Core Assessments
INSERT INTO public.assessments (id, skill_id, version, title, description, time_limit_minutes, allowed_conditions, stages) VALUES
('assess-hash-01', 'skill-hash-02', '2.1.0', 'Hash Tables & Collision Strategies Competency Evaluation', 'Four-stage interactive assessment evaluating conceptual mechanics, bug remediation in collision resolution, novel problem transfer, and architectural trade-off justification.', 30, 'AI_DISCLOSURE_REQUIRED', '[
  {
    "id": "stage-1-concept",
    "type": "EXPLANATION",
    "prompt": "Explain why a hash table provides an average case of O(1) lookup time, and identify a concrete scenario where this assumption degrades to O(N). In your explanation, contrast how separate chaining vs open addressing handle high load factors.",
    "rubricCriteria": [
      { "name": "Conceptual Accuracy", "maxPoints": 25, "description": "Accurately details hash bucket distribution, load factors, and collision mechanisms." },
      { "name": "Degradation Modes", "maxPoints": 25, "description": "Explains worst-case O(N) breakdown (e.g., poor hash function or intentional HashDoS attack)." },
      { "name": "Collision Resolution Contrast", "maxPoints": 25, "description": "Accurately contrasts open addressing vs chaining." },
      { "name": "Clarity & Terminology", "maxPoints": 25, "description": "Uses precise systems terminology without vague assertions." }
    ]
  },
  {
    "id": "stage-2-mod",
    "type": "MODIFICATION",
    "prompt": "The provided naive Linear Probing Hash Map implementation suffers from an infinite loop bug during key deletion. Fix the bug.",
    "starterCode": "class NaiveLinearHashMap<K, V> {\n  delete(key: K): boolean {\n    // Buggy deletion logic\n  }\n}",
    "targetRequirements": ["Implement tombstone markers (isDeleted) or backward-shift rehashing."],
    "rubricCriteria": [
      { "name": "Bug Diagnosis", "maxPoints": 30, "description": "Accurately diagnoses probe chain truncation." },
      { "name": "Code Correction", "maxPoints": 40, "description": "Provides valid tombstone fix." }
    ]
  }
]'::jsonb)
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;

-- 6. Core Projects
INSERT INTO public.projects (id, title, description, target_role, required_skills, prerequisites, difficulty, difficulty_heuristic_note, learning_outcomes, milestones, assessment_method, ai_assistance_rules, extension_challenges) VALUES
('proj-01', 'High-Throughput In-Memory Key-Value Store with TTL & Compaction', 'Build an in-memory key-value storage engine featuring custom hash bucket partitioning, lock-striped concurrent read-writes, and asynchronous background tombstone compaction.', 'Senior Backend Systems Engineer', ARRAY['skill-hash-02', 'skill-concurrency-03'], ARRAY['skill-ds-01'], 'Challenging', 'Heuristic based on requirement of 2 advanced core competencies.', ARRAY['Implement lock-striping to minimize contention across hash buckets.', 'Manage memory safely with zero-copy serialization buffers.'], '[{"id": "m-1", "title": "Milestone 1: Core Hash Bucket Engine", "description": "Implement custom linear probing bucket array.", "acceptanceCriteria": ["Dynamic resizing at 0.70 load factor"]}]'::jsonb, 'Controlled Code Comprehension + Live Concurrency Stress Benchmarking', 'AI assistance allowed for generating test harnesses.', ARRAY['Add Append-Only Log (AOL) persistence with fsync batching.'])
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title;
