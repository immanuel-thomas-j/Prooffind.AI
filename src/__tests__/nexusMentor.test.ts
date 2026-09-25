import { describe, it, expect } from "vitest";
import { NexusMentorService } from "../services/nexusMentorService";

describe("NexusMentorService", () => {
  it("provides Socratic hints without solving the active assessment in ASSESSMENT mode", async () => {
    const res = await NexusMentorService.query("Can you give me the answer to stage 2?", "ASSESSMENT");
    expect(res.sender).toBe("nexus");
    expect(res.mode).toBe("ASSESSMENT");
    expect(res.content).toContain("restricted");
    expect(res.limitationsDisclosure).toContain("suppressed during active assessment");
  });

  it("explains assessment rubric and format in ASSESSMENT_PREP mode without answers", async () => {
    const res = await NexusMentorService.query("How will I be evaluated?", "ASSESSMENT_PREP");
    expect(res.content).toContain("Concept Explanation");
    expect(res.content).toContain("Controlled Modification");
    expect(res.content).toContain("Transfer Task");
  });

  it("handles malformed or empty messages safely", async () => {
    const res = await NexusMentorService.query("", "LEARNING");
    expect(res.sender).toBe("nexus");
    expect(res.content).toContain("unformatted query");
  });
});
