import test from "node:test";
import assert from "node:assert/strict";
import { parseBrief, promptFor, SAMPLE_BRIEF, toMarkdown } from "../src/brief.js";

test("accepts a fenced JSON response and preserves known and unknown assignments", () => {
  assert.deepEqual(parseBrief(`\`\`\`json\n${JSON.stringify(SAMPLE_BRIEF)}\n\`\`\``), SAMPLE_BRIEF);
  assert.match(toMarkdown(SAMPLE_BRIEF), /Unassigned \| No deadline/);
});

test("rejects incomplete and structurally invalid model responses", () => {
  for (const output of ["bad output", "null", '{"summary":"x","actions":[],"watch":null}', '{"summary":"x","actions":[{"task":""}],"watch":[]}']) {
    assert.throws(() => parseBrief(output));
  }
});

test("supports a handoff with no pending items", () => {
  const brief = { summary: "All orders processed.", actions: [], watch: [] };
  assert.deepEqual(parseBrief(JSON.stringify(brief)), brief);
});

test("serializes the notes separately from the brief instructions", () => {
  const notes = 'Line 1 says "awaiting parts".\nLine 2 mentions 23:00.';
  assert.ok(promptFor(notes).endsWith(JSON.stringify(notes)));
});
