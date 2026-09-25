import { describe, it, expect } from "vitest";
import { SkillGraphService } from "../services/skillGraphService";
import { Skill, SkillPrerequisite } from "../domain/types";

describe("SkillGraphService", () => {
  const mockSkills: Skill[] = [
    {
      id: "skill-1",
      slug: "basics",
      name: "Basics",
      category: "Computer Science",
      difficulty: "Fundamental",
      description: "Basics",
      coreConcepts: [],
      evaluationFocus: "",
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "skill-2",
      slug: "intermediate",
      name: "Intermediate",
      category: "Computer Science",
      difficulty: "Intermediate",
      description: "Intermediate",
      coreConcepts: [],
      evaluationFocus: "",
      createdAt: "",
      updatedAt: "",
    },
    {
      id: "skill-3",
      slug: "advanced",
      name: "Advanced",
      category: "Distributed Systems",
      difficulty: "Advanced",
      description: "Advanced",
      coreConcepts: [],
      evaluationFocus: "",
      createdAt: "",
      updatedAt: "",
    },
  ];

  it("should validate a correct acyclic dependency graph", () => {
    const validPrereqs: SkillPrerequisite[] = [
      { id: "e1", skillId: "skill-2", prerequisiteSkillId: "skill-1", relationType: "STRICT_PREREQUISITE" },
      { id: "e2", skillId: "skill-3", prerequisiteSkillId: "skill-2", relationType: "STRICT_PREREQUISITE" },
    ];

    const result = SkillGraphService.validateGraph(mockSkills, validPrereqs);
    expect(result.isValid).toBe(true);
    expect(result.hasCycles).toBe(false);
    expect(result.errors).toHaveLength(0);
  });

  it("should detect cyclic prerequisite dependencies", () => {
    // 1 -> 2 -> 3 -> 1 (Cycle)
    const cyclicPrereqs: SkillPrerequisite[] = [
      { id: "e1", skillId: "skill-2", prerequisiteSkillId: "skill-1", relationType: "STRICT_PREREQUISITE" },
      { id: "e2", skillId: "skill-3", prerequisiteSkillId: "skill-2", relationType: "STRICT_PREREQUISITE" },
      { id: "e3", skillId: "skill-1", prerequisiteSkillId: "skill-3", relationType: "STRICT_PREREQUISITE" },
    ];

    const result = SkillGraphService.validateGraph(mockSkills, cyclicPrereqs);
    expect(result.isValid).toBe(false);
    expect(result.hasCycles).toBe(true);
    expect(result.cycleNodes?.length).toBeGreaterThan(0);
  });

  it("should catch unknown/missing skill references in prerequisites", () => {
    const invalidPrereqs: SkillPrerequisite[] = [
      { id: "e1", skillId: "unknown-skill", prerequisiteSkillId: "skill-1", relationType: "STRICT_PREREQUISITE" },
    ];

    const result = SkillGraphService.validateGraph(mockSkills, invalidPrereqs);
    expect(result.isValid).toBe(false);
    expect(result.missingSkillReferences).toContain("unknown-skill");
  });

  it("should produce a valid topological ordering", () => {
    const validPrereqs: SkillPrerequisite[] = [
      { id: "e1", skillId: "skill-3", prerequisiteSkillId: "skill-2", relationType: "STRICT_PREREQUISITE" },
      { id: "e2", skillId: "skill-2", prerequisiteSkillId: "skill-1", relationType: "STRICT_PREREQUISITE" },
    ];

    const sorted = SkillGraphService.getTopologicalSort(mockSkills, validPrereqs);
    const sortedIds = sorted.map((s) => s.id);
    expect(sortedIds.indexOf("skill-1")).toBeLessThan(sortedIds.indexOf("skill-2"));
    expect(sortedIds.indexOf("skill-2")).toBeLessThan(sortedIds.indexOf("skill-3"));
  });
});
