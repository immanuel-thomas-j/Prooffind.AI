import { Skill, SkillPrerequisite } from "../domain/types";

export interface GraphValidationResult {
  isValid: boolean;
  hasCycles: boolean;
  cycleNodes?: string[];
  missingSkillReferences?: string[];
  errors: string[];
}

export class SkillGraphService {
  /**
   * Validates that the skill prerequisites form a valid Directed Acyclic Graph (DAG)
   * and that all referenced skill IDs exist.
   */
  static validateGraph(skills: Skill[], prerequisites: SkillPrerequisite[]): GraphValidationResult {
    const skillIdSet = new Set(skills.map((s) => s.id));
    const errors: string[] = [];
    const missingRefs: string[] = [];

    // Check for missing skill references
    for (const edge of prerequisites) {
      if (!skillIdSet.has(edge.skillId)) {
        errors.push(`Prerequisite edge references unknown skillId: ${edge.skillId}`);
        missingRefs.push(edge.skillId);
      }
      if (!skillIdSet.has(edge.prerequisiteSkillId)) {
        errors.push(`Prerequisite edge references unknown prerequisiteSkillId: ${edge.prerequisiteSkillId}`);
        missingRefs.push(edge.prerequisiteSkillId);
      }
    }

    // Build adjacency list for cycle detection
    // Edge: prerequisiteSkillId -> skillId (prerequisite must come before target skill)
    const adj = new Map<string, string[]>();
    for (const skill of skills) {
      adj.set(skill.id, []);
    }
    for (const edge of prerequisites) {
      if (adj.has(edge.prerequisiteSkillId)) {
        adj.get(edge.prerequisiteSkillId)!.push(edge.skillId);
      }
    }

    // Cycle detection using DFS with 3-color states: 0=unvisited, 1=visiting, 2=visited
    const state = new Map<string, number>();
    for (const skill of skills) {
      state.set(skill.id, 0);
    }

    let cycleFound = false;
    const cycleNodes: string[] = [];

    function dfs(node: string, path: string[]): boolean {
      state.set(node, 1);
      path.push(node);

      const neighbors = adj.get(node) || [];
      for (const neighbor of neighbors) {
        const neighborState = state.get(neighbor) || 0;
        if (neighborState === 1) {
          cycleFound = true;
          cycleNodes.push(...path.slice(path.indexOf(neighbor)), neighbor);
          return true;
        }
        if (neighborState === 0) {
          if (dfs(neighbor, path)) return true;
        }
      }

      path.pop();
      state.set(node, 2);
      return false;
    }

    for (const skill of skills) {
      if ((state.get(skill.id) || 0) === 0) {
        if (dfs(skill.id, [])) {
          errors.push(`Cycle detected in skill graph involving: ${cycleNodes.join(" -> ")}`);
          break;
        }
      }
    }

    return {
      isValid: errors.length === 0,
      hasCycles: cycleFound,
      cycleNodes: cycleFound ? cycleNodes : undefined,
      missingSkillReferences: missingRefs.length > 0 ? missingRefs : undefined,
      errors,
    };
  }

  /**
   * Returns topological order of skills respecting prerequisites.
   * If a cycle is present, throws an error or returns safe default.
   */
  static getTopologicalSort(skills: Skill[], prerequisites: SkillPrerequisite[]): Skill[] {
    const inDegree = new Map<string, number>();
    const adj = new Map<string, string[]>();

    for (const s of skills) {
      inDegree.set(s.id, 0);
      adj.set(s.id, []);
    }

    for (const edge of prerequisites) {
      if (adj.has(edge.prerequisiteSkillId) && inDegree.has(edge.skillId)) {
        adj.get(edge.prerequisiteSkillId)!.push(edge.skillId);
        inDegree.set(edge.skillId, (inDegree.get(edge.skillId) || 0) + 1);
      }
    }

    const queue: string[] = [];
    inDegree.forEach((deg, id) => {
      if (deg === 0) {
        queue.push(id);
      }
    });

    const sortedIds: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      sortedIds.push(current);

      for (const neighbor of adj.get(current) || []) {
        const nextDeg = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, nextDeg);
        if (nextDeg === 0) {
          queue.push(neighbor);
        }
      }
    }

    // Map sorted IDs back to skills, appending any remaining in case of partial graphs
    const skillMap = new Map(skills.map((s) => [s.id, s]));
    const result: Skill[] = [];

    for (const id of sortedIds) {
      const skill = skillMap.get(id);
      if (skill) {
        result.push(skill);
        skillMap.delete(id);
      }
    }

    skillMap.forEach((remaining) => {
      result.push(remaining);
    });

    return result;
  }
}
