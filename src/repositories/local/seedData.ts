import {
  LearnerProfile,
  Skill,
  SkillPrerequisite,
  EvidenceItem,
  Assessment,
  Project,
} from "../../domain/types";

export const DEMO_USER_ID = "demo-learner-immanuel-001";

export const SEED_PROFILE: LearnerProfile = {
  id: "profile-immanuel-001",
  userId: DEMO_USER_ID,
  name: "Immanuel Thomas J",
  learningGoal: "Validate genuine AI systems architecture, data structure invariants, and open-source tooling competencies.",
  targetRole: "Software Engineer & AI Architect",
  experienceLevel: "Advanced",
  programmingLanguages: ["JavaScript", "TypeScript", "Python", "Go", "HTML/CSS"],
  selfReportedSkills: [
    "Hash Tables & Collision Resolution",
    "Concurrency, Mutexes & Race Conditions",
    "AI Systems Architecture & Prompt Crafts",
    "Open Source Tooling (OpenForge)",
    "Distributed Caching & Invalidation"
  ],
  githubUrl: "https://github.com/immanuel-thomas-j",
  codingProfileUrl: "https://leetcode.com/u/immanuel-thomas-j/",
  preferredLearningHoursPerWeek: 12,
  aiAssistancePreference: "balanced",
  isDemoUser: true,
  createdAt: "2026-03-01T10:00:00Z",
  updatedAt: "2026-09-25T13:00:00Z",
};

export const SEED_SKILLS: Skill[] = [
  {
    id: "skill-ds-01",
    slug: "data-structures-core",
    name: "Core Data Structures & Memory Layouts",
    category: "Computer Science",
    difficulty: "Fundamental",
    description: "Memory representation of arrays, linked lists, dynamic allocation, pointer traversals, and amortized complexity bounds.",
    coreConcepts: ["Contiguous vs node-based memory", "Cache locality", "Amortized resizing", "Pointer arithmetic"],
    evaluationFocus: "Memory complexity trade-offs and cache efficiency in production systems.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "skill-hash-02",
    slug: "hash-tables-collisions",
    name: "Hash Tables & Collision Resolution",
    category: "Computer Science",
    difficulty: "Intermediate",
    description: "Hash functions, load factor thresholds, open addressing vs separate chaining, worst-case O(N) degradation, and DoS resilience.",
    coreConcepts: ["Universal hashing", "Load factors", "Linear probing vs chaining", "Collision degradation", "HashDoS"],
    evaluationFocus: "Ability to explain degradation modes and implement collision-safe dynamic structures under constraints.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "skill-concurrency-03",
    slug: "concurrency-race-conditions",
    name: "Concurrency, Mutexes & Race Conditions",
    category: "Backend Engineering",
    difficulty: "Advanced",
    description: "Thread synchronization, data races, deadlocks, atomic operations, re-entrant locks, and lock-free concurrency primitives.",
    coreConcepts: ["Mutex vs ReadWriteLock", "Data race vs race condition", "Deadlock conditions", "Memory barriers", "Channel synchronization"],
    evaluationFocus: "Detecting and refactoring subtle synchronization bugs and race conditions in concurrent request pipelines.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "skill-cache-04",
    slug: "distributed-caching",
    name: "Distributed Caching & Invalidation",
    category: "Distributed Systems",
    difficulty: "Advanced",
    description: "Cache patterns (cache-aside, write-through), cache stamps, thundering herd problem, TTL decay, and consensus-driven invalidation.",
    coreConcepts: ["Cache-aside pattern", "Thundering herd mitigation", "Probabilistic early expiration", "Two-phase invalidation"],
    evaluationFocus: "Designing fault-tolerant cache layers capable of surviving high-concurrency node restarts.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "skill-api-05",
    slug: "rest-microservices",
    name: "REST API Contracts & Idempotency",
    category: "Backend Engineering",
    difficulty: "Intermediate",
    description: "Contract-first API design, idempotent mutations, status code semantics, structured error envelopes, and backwards compatibility.",
    coreConcepts: ["Idempotency keys", "Content negotiation", "HATEOAS vs pragmatic REST", "Versioning strategies"],
    evaluationFocus: "Designing bulletproof payment and mutation endpoints with idempotent retries.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "skill-db-06",
    slug: "db-indexing-opt",
    name: "Database Indexing & Query Execution Plans",
    category: "Backend Engineering",
    difficulty: "Intermediate",
    description: "B-Tree vs Hash indexes, composite index column order, table scans, join algorithms, and execution plan cost estimation.",
    coreConcepts: ["B-Tree branching factor", "Covering indexes", "Index selectivity", "EXPLAIN ANALYZE interpretation"],
    evaluationFocus: "Optimizing high-latency multi-join queries through index redesign rather than hardware scaling.",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  }
];

// Valid DAG (Acyclic):
// skill-ds-01 -> skill-hash-02 -> skill-cache-04
// skill-concurrency-03 -> skill-cache-04
// skill-api-05 -> skill-cache-04
export const SEED_PREREQUISITES: SkillPrerequisite[] = [
  {
    id: "pre-1",
    skillId: "skill-hash-02",
    prerequisiteSkillId: "skill-ds-01",
    relationType: "STRICT_PREREQUISITE",
  },
  {
    id: "pre-2",
    skillId: "skill-cache-04",
    prerequisiteSkillId: "skill-hash-02",
    relationType: "STRICT_PREREQUISITE",
  },
  {
    id: "pre-3",
    skillId: "skill-cache-04",
    prerequisiteSkillId: "skill-concurrency-03",
    relationType: "RECOMMENDED_BACKGROUND",
  },
  {
    id: "pre-4",
    skillId: "skill-cache-04",
    prerequisiteSkillId: "skill-api-05",
    relationType: "RECOMMENDED_BACKGROUND",
  },
];

export const SEED_EVIDENCE: EvidenceItem[] = [
  {
    id: "ev-01",
    userId: DEMO_USER_ID,
    skillId: "skill-ds-01",
    type: "ASSESSMENT_RESULT",
    category: "VERIFIED",
    title: "Core Data Structures Diagnostic Evaluation",
    source: "ProofPath Diagnostic Lab v1.2",
    dateCollected: "2026-03-10T11:00:00Z",
    reliabilityLimitations: "Evaluated under open-notes, timed proctored environment. Covers standard array vs linked list mechanics; does not assess custom OS-level allocators.",
    directlyAssessed: true,
    aiAssistanceAllowed: false,
    notes: "Demonstrated accurate Big-O analysis and memory pointer arithmetic.",
    createdAt: "2026-03-10T11:00:00Z",
    updatedAt: "2026-03-10T11:00:00Z",
  },
  {
    id: "ev-02",
    userId: DEMO_USER_ID,
    skillId: "skill-hash-02",
    type: "GITHUB_REPOSITORY",
    category: "INFERRED",
    title: "Public Repository: go-cache-hash-impl",
    source: "https://github.com/alex-rivera-demo/go-cache-hash-impl",
    dateCollected: "2026-03-15T09:30:00Z",
    reliabilityLimitations: "Repository contains clean hash table code, but commits do not prove sole authorship or deep understanding of collision degradation modes without direct explanation.",
    directlyAssessed: false,
    aiAssistanceAllowed: true,
    notes: "Indirect evidence of hash table familiarity. Calibration assessment recommended.",
    createdAt: "2026-03-15T09:30:00Z",
    updatedAt: "2026-03-15T09:30:00Z",
  },
  {
    id: "ev-03",
    userId: DEMO_USER_ID,
    skillId: "skill-concurrency-03",
    type: "RESUME_CLAIM",
    category: "CLAIMED",
    title: "Resume Claim: 'Designed lock-free concurrent ingestion pipeline'",
    source: "Uploaded Resume (2026 Software Engineer profile)",
    dateCollected: "2026-03-20T14:00:00Z",
    reliabilityLimitations: "Self-reported claim on resume. No reproducible code sample or controlled debugging assessment provided yet.",
    directlyAssessed: false,
    aiAssistanceAllowed: true,
    notes: "Significant skill-evidence discrepancy: High claim with zero direct evaluation.",
    createdAt: "2026-03-20T14:00:00Z",
    updatedAt: "2026-03-20T14:00:00Z",
  },
  {
    id: "ev-04",
    userId: DEMO_USER_ID,
    skillId: "skill-api-05",
    type: "PROJECT_DESCRIPTION",
    category: "INFERRED",
    title: "Production E-Commerce Checkout API Spec",
    source: "Portfolio documentation & Swagger OpenAPI specification",
    dateCollected: "2026-03-18T16:45:00Z",
    reliabilityLimitations: "Documentation presents standard REST endpoints with Idempotency-Key headers. Does not verify behavior under network timeout re-deliveries.",
    directlyAssessed: false,
    aiAssistanceAllowed: true,
    notes: "Shows familiarity with API conventions, awaiting transfer evaluation.",
    createdAt: "2026-03-18T16:45:00Z",
    updatedAt: "2026-03-18T16:45:00Z",
  },
];

export const SEED_ASSESSMENTS: Assessment[] = [
  {
    id: "assess-hash-01",
    skillId: "skill-hash-02",
    version: "2.1.0",
    title: "Hash Tables & Collision Strategies Competency Evaluation",
    description: "Four-stage interactive assessment evaluating conceptual mechanics, bug remediation in collision resolution, novel problem transfer, and architectural trade-off justification.",
    timeLimitMinutes: 30,
    allowedConditions: "AI_DISCLOSURE_REQUIRED",
    stages: [
      {
        id: "stage-1-concept",
        type: "EXPLANATION",
        prompt: "Explain why a hash table provides an average case of O(1) lookup time, and identify a concrete scenario where this assumption degrades to O(N). In your explanation, contrast how separate chaining vs open addressing handle high load factors.",
        rubricCriteria: [
          { name: "Conceptual Accuracy", maxPoints: 25, description: "Accurately details hash bucket distribution, load factors, and collision mechanisms." },
          { name: "Degradation Modes", maxPoints: 25, description: "Explains worst-case O(N) breakdown (e.g., poor hash function or intentional HashDoS attack)." },
          { name: "Collision Resolution Contrast", maxPoints: 25, description: "Accurately contrasts open addressing (clustering, probe sequences) vs chaining (pointer overhead, cache locality)." },
          { name: "Clarity & Terminology", maxPoints: 25, description: "Uses precise systems terminology without vague or generic assertions." },
        ],
      },
      {
        id: "stage-2-mod",
        type: "MODIFICATION",
        prompt: "The provided naive Linear Probing Hash Map implementation suffers from an infinite loop bug during key deletion, and fails to rehash when load factor exceeds 0.75. Review the code, describe the bug causing lookup failure after deletion, and submit the corrected deletion logic.",
        starterCode: `class NaiveLinearHashMap<K, V> {
  private buckets: Array<{ key: K; value: V; isDeleted?: boolean } | null>;
  private size: number = 0;
  private capacity: number = 8;

  constructor() {
    this.buckets = new Array(this.capacity).fill(null);
  }

  private hash(key: K): number {
    const str = String(key);
    let hashVal = 0;
    for (let i = 0; i < str.length; i++) {
      hashVal = (hashVal << 5) - hashVal + str.charCodeAt(i);
      hashVal |= 0;
    }
    return Math.abs(hashVal) % this.capacity;
  }

  // BUG: Direct null assignment breaks probe chains for existing subsequent keys!
  delete(key: K): boolean {
    let index = this.hash(key);
    let probes = 0;
    while (this.buckets[index] !== null && probes < this.capacity) {
      if (this.buckets[index]?.key === key) {
        // FIXME: Simply setting to null causes future lookups for colliding keys to abort prematurely!
        this.buckets[index] = null;
        this.size--;
        return true;
      }
      index = (index + 1) % this.capacity;
      probes++;
    }
    return false;
  }
}`,
        targetRequirements: [
          "Identify why setting the bucket to null corrupts linear probe chains.",
          "Implement tombstone markers ('isDeleted') or backward-shift rehashing.",
          "Document edge cases: full table, deleting non-existent key, re-inserting into tombstone."
        ],
        rubricCriteria: [
          { name: "Bug Diagnosis", maxPoints: 30, description: "Accurately diagnoses probe chain truncation caused by premature null bucket termination." },
          { name: "Code Correction", maxPoints: 40, description: "Provides valid tombstone or cluster displacement fix." },
          { name: "Edge Case Awareness", maxPoints: 30, description: "Explicitly handles duplicate deletes, tombstone reuse on insert, and load factor computation." },
        ],
      },
      {
        id: "stage-3-transfer",
        type: "TRANSFER",
        prompt: "Transfer Challenge: You are building an in-memory session cache that must hold up to 1,000,000 active sessions with individual TTL (Time-To-Live) expirations. Explain how you would combine a Hash Table with another data structure to achieve both O(1) session lookups AND efficient O(1) eviction of the oldest expired sessions, without scanning all 1,000,000 buckets on every tick.",
        targetRequirements: [
          "Specify the secondary data structure (e.g. Doubly Linked List / Min-Heap / Time Wheel) and how it is linked.",
          "Detail how lookups, updates, and expirations synchronize between the structures.",
          "Analyze memory trade-offs and concurrency hazards."
        ],
        rubricCriteria: [
          { name: "Structural Synthesis", maxPoints: 40, description: "Synthesizes hash map + doubly linked list / time-wheel with cross-pointers accurately." },
          { name: "Complexity Analysis", maxPoints: 30, description: "Validates O(1) or O(log K) operational bounds for get, put, and evict." },
          { name: "Systems Trade-Offs", maxPoints: 30, description: "Evaluates memory overhead per entry and pointer synchronization pitfalls." },
        ],
      },
      {
        id: "stage-4-followup",
        type: "FOLLOW_UP",
        prompt: "Follow-up Reasoning: Suppose an adversary identifies your hash function and sends 50,000 requests whose keys produce identical hash bucket indices (HashDoS attack). What specific architectural defense would you implement at the runtime, algorithmic, or firewall level to prevent CPU exhaustion?",
        rubricCriteria: [
          { name: "Security Architecture", maxPoints: 50, description: "Recommends randomized SipHash seeds, collision tree-ification (Java HashMap style Red-Black trees), or reverse proxy limits." },
          { name: "Trade-off Justification", maxPoints: 50, description: "Explains performance costs vs protection guarantees of each defensive layer." },
        ],
      }
    ],
    createdAt: "2026-02-15T00:00:00Z",
    updatedAt: "2026-02-15T00:00:00Z",
  },
  {
    id: "assess-concurrency-02",
    skillId: "skill-concurrency-03",
    version: "1.4.0",
    title: "Concurrency, Race Conditions & Mutexes Assessment",
    description: "Multi-stage assessment examining race condition detection in concurrent balances, deadlock prevention, and channel vs lock patterns.",
    timeLimitMinutes: 35,
    allowedConditions: "AI_RESTRICTED",
    stages: [
      {
        id: "stage-1-conc-concept",
        type: "EXPLANATION",
        prompt: "Distinguish between a 'Data Race' and a 'Race Condition'. Can an application have no data races yet still suffer from severe race conditions? Provide a real-world scenario illustrating your answer.",
        rubricCriteria: [
          { name: "Theoretical Precision", maxPoints: 50, description: "Accurately defines data race (memory level) vs race condition (semantic/order level)." },
          { name: "Concrete Scenario", maxPoints: 50, description: "Provides valid check-then-act balance transfer or inventory reservation example." },
        ],
      },
      {
        id: "stage-2-conc-mod",
        type: "MODIFICATION",
        prompt: "Review the concurrent bank account transfer function below. It uses mutex locks but is vulnerable to circular deadlock when Account A transfers to Account B at the exact same moment Account B transfers to Account A. Fix the deadlock vulnerability.",
        starterCode: `type Account struct {
    ID      int
    Balance int
    mu      sync.Mutex
}

// BUG: Deadlock risk if Transfer(acc1, acc2, 50) and Transfer(acc2, acc1, 30) run concurrently!
func Transfer(from *Account, to *Account, amount int) error {
    from.mu.Lock()
    defer from.mu.Unlock()

    to.mu.Lock()
    defer to.mu.Unlock()

    if from.Balance < amount {
        return errors.New("insufficient funds")
    }

    from.Balance -= amount
    to.Balance += amount
    return nil
}`,
        targetRequirements: [
          "Explain why cyclic lock acquisition causes deadlock under concurrent inverse calls.",
          "Implement deterministic lock ordering (e.g., sort by Account ID before locking).",
          "Ensure locks are safely released even on error paths."
        ],
        rubricCriteria: [
          { name: "Deadlock Explanation", maxPoints: 35, description: "Clearly explains Coffman hold-and-wait circular dependency condition." },
          { name: "Deterministic Ordering", maxPoints: 45, description: "Implements lock acquisition ordered by consistent ID sequence." },
          { name: "Defensive Programming", maxPoints: 20, description: "Avoids double-locking when from == to, handles all return paths safely." },
        ],
      }
    ],
    createdAt: "2026-02-20T00:00:00Z",
    updatedAt: "2026-02-20T00:00:00Z",
  }
];

export const SEED_PROJECTS: Project[] = [
  {
    id: "proj-01",
    title: "High-Throughput In-Memory Key-Value Store with TTL & Compaction",
    description: "Build an in-memory key-value storage engine featuring custom hash bucket partitioning, lock-striped concurrent read-writes, and asynchronous background tombstone compaction.",
    targetRole: "Senior Backend Systems Engineer",
    requiredSkills: ["skill-hash-02", "skill-concurrency-03"],
    prerequisites: ["skill-ds-01"],
    difficulty: "Challenging",
    difficultyHeuristicNote: "Heuristic based on requirement of 2 advanced core competencies (concurrency + collision algorithms) and multi-threaded test coverage.",
    learningOutcomes: [
      "Implement lock-striping to minimize contention across hash buckets.",
      "Manage memory safely with zero-copy serialization buffers.",
      "Design deterministic tombstone reclamation without blocking active client reads."
    ],
    milestones: [
      {
        id: "m-1",
        title: "Milestone 1: Core Hash Bucket Engine",
        description: "Implement custom linear probing or chained bucket array with load factor tracking.",
        acceptanceCriteria: ["Dynamic resizing at 0.70 load factor", "Unit tests verifying 100,000 continuous insertions"]
      },
      {
        id: "m-2",
        title: "Milestone 2: Concurrency & Lock-Striping",
        description: "Partition table into N independent segments guarded by individual RWMutexes.",
        acceptanceCriteria: ["Zero race conditions reported by Go -race detector or Valgrind", "Sustains 50,000 concurrent ops/sec"]
      },
      {
        id: "m-3",
        title: "Milestone 3: TTL Eviction Worker",
        description: "Background worker consuming a min-heap or timing-wheel for expired key cleanups.",
        acceptanceCriteria: ["Expired entries never returned on Get()", "Worker CPU utilization stays below 5% when idle"]
      }
    ],
    assessmentMethod: "Controlled Code Comprehension + Live Concurrency Stress Benchmarking in ProofPath Sandbox",
    aiAssistanceRules: "AI assistance allowed for generating test harnesses and benchmark scripts; core synchronization logic must be explained and modified in controlled assessment mode.",
    extensionChallenges: [
      "Add Append-Only Log (AOL) persistence with fsync batching.",
      "Implement consistent hashing ring for multi-node distribution."
    ],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  },
  {
    id: "proj-02",
    title: "Distributed Rate Limiter with Sliding Window & Redis Token Bucket",
    description: "Design and benchmark a distributed API gateway rate limiter supporting tiered client quotas, sliding-window log calculations, and graceful degradation during network partitions.",
    targetRole: "Senior Backend Systems Engineer",
    requiredSkills: ["skill-api-05", "skill-cache-04"],
    prerequisites: ["skill-hash-02"],
    difficulty: "Accessible",
    difficultyHeuristicNote: "Heuristic based on single-component network architecture with standard Lua script atomicity.",
    learningOutcomes: [
      "Implement atomic Redis Lua scripts to avoid race conditions during counter increments.",
      "Compare token bucket vs sliding window counter memory footprints under 10M active IP addresses.",
      "Design fallback local rate-limiting when the central cache cluster is unreachable."
    ],
    milestones: [
      {
        id: "m-1",
        title: "Milestone 1: Token Bucket Algorithm",
        description: "Pure in-memory prototype with replenishment rate calculations.",
        acceptanceCriteria: ["Passes unit tests for burst vs sustained limiters"]
      },
      {
        id: "m-2",
        title: "Milestone 2: Distributed Integration",
        description: "Package logic into HTTP middleware with standard 429 and Retry-After headers.",
        acceptanceCriteria: ["RFC 6585 compliance", "Accurate Retry-After header calculation"]
      }
    ],
    assessmentMethod: "Targeted Transfer Assessment on partition split-brain resilience",
    aiAssistanceRules: "Practice mode with Nexus AI mentor guidance; AI code generation disclosed in submission.",
    extensionChallenges: [
      "Support distributed client sliding logs without exploding memory.",
      "Implement geographic latency-based rate-limit token synchronization."
    ],
    createdAt: "2026-03-01T00:00:00Z",
    updatedAt: "2026-03-01T00:00:00Z",
  }
];
