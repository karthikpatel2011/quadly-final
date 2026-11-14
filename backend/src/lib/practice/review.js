// Scenario review checks — the gate every scenario passes before it can be
// played. Three layers: the zod schema, the evidence-uniqueness rule (the
// scripted evidence must support exactly one root cause), and fix sanity.
// The admin review queue and the test suite run the same function.

import { scenarioSchema } from './schema.js';

export function contentCheck(rawScenario) {
  const issues = [];
  const parsed = scenarioSchema.safeParse(rawScenario);
  if (!parsed.success) {
    return {
      ok: false,
      schemaOk: false,
      issues: [parsed.error.issues[0]?.message || 'The scenario does not match the content schema.'],
    };
  }
  const s = parsed.data;

  // 1. Exactly one true root cause.
  const correct = s.rootCauses.filter((rc) => rc.correct === true);
  if (correct.length !== 1) {
    issues.push(`Exactly one root cause must be marked correct — found ${correct.length}.`);
  }
  const trueRoot = correct[0] || null;

  // 2. Evidence uniqueness: at least two evidence/check actions support the
  //    true root cause, and every wrong root cause is explicitly refuted by
  //    at least one reveal. An incident must be solvable from the evidence.
  const reveals = s.actions
    .filter((a) => a.reveal)
    .map((a) => ({ group: a.group, reveal: a.reveal }));
  const evidenceish = reveals.filter((r) => r.group === 'evidence' || r.group === 'check');
  if (trueRoot) {
    const support = evidenceish.filter((r) => r.reveal.supports === trueRoot.id).length;
    if (support < 2) {
      issues.push(`The true root cause needs at least 2 supporting evidence/check reveals — found ${support}.`);
    }
  }
  const wrong = s.rootCauses.filter((rc) => !rc.correct);
  for (const rc of wrong) {
    const refuted = reveals.filter((r) => (r.reveal.refutes || []).includes(rc.id)).length;
    if (refuted === 0) {
      issues.push(`Wrong root cause "${rc.id}" is never refuted by any evidence — a student cannot rule it out.`);
    }
  }

  // 3. Fix sanity: one safe fix, at least one that does nothing, one that
  //    makes things worse — the choice must be real, not cosmetic.
  const safe = s.fixes.filter((f) => f.safety === 'safe').length;
  const noop = s.fixes.filter((f) => f.safety === 'noop').length;
  const harmful = s.fixes.filter((f) => f.safety === 'harmful').length;
  if (safe !== 1) issues.push(`Exactly one fix may be safe — found ${safe}.`);
  if (noop < 1) issues.push('There must be at least one fix that does nothing.');
  if (harmful < 1) issues.push('There must be at least one fix that makes things worse.');

  // 4. Expert pressure sanity: cascade events must land inside the time limit.
  if (s.timeLimitMinutes) {
    for (const ev of s.events || []) {
      if (ev.atMin >= s.timeLimitMinutes) {
        issues.push(`Cascade event at minute ${ev.atMin} falls outside the ${s.timeLimitMinutes}-minute limit.`);
      }
    }
  }

  // 5. Guided scenarios guide: level 1 needs at least two step prompts.
  if (s.level === 1 && (s.guidance || []).length < 2) {
    issues.push('A guided scenario needs at least 2 step prompts in guidance.');
  }

  return { ok: issues.length === 0, schemaOk: true, issues };
}
