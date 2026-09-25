import { describe, it, expect } from "vitest";
import { supabase } from "../lib/supabaseClient";

describe("Supabase Live Backend Connection", () => {
  it("connects to user Supabase URL without network errors", async () => {
    expect(supabase).toBeDefined();
    // Test auth session or public endpoint
    const { data, error } = await supabase.auth.getSession();
    expect(error).toBeNull();
  });
});
