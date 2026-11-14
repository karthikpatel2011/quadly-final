// Shared entitlement — the one place that answers "what does this plan
// include?". Practice is the first consumer; anything else that grows a paid
// tier should reuse this module so the answer stays consistent.
//
// Today there is no billing system: an account is `pro` only if its stored
// plan says so (set manually by an admin via the admin route). Free
// students get the Daily Drill and a few incidents a week; pro students get
// every incident and the defend step.

export function planTier(account) {
  return account?.plan === 'pro' ? 'pro' : 'free';
}

export function practiceEntitlements(account) {
  const pro = planTier(account) === 'pro';
  return {
    plan: pro ? 'pro' : 'free',
    dailyDrill: true,                    // the daily habit is never paywalled
    freeIncidentStartsPerWeek: pro ? Infinity : 2,
    allIncidents: pro,
    postmortemEditor: true,              // writing stays open for everyone
    postmortemAICritique: true,          // with a deterministic fallback
    defendStep: pro,                     // the interview-skill proof step
  };
}

// Workplace — the simulated first job. Free students get the full first week
// (the habit-forming stretch) plus guided/standard tiers; pro unlocks the
// whole starter story and the expert tier. The Voice Defend step is never
// paywalled: it is the anti-cheat proof, not a luxury.
export function workplaceEntitlements(account) {
  const pro = planTier(account) === 'pro';
  return {
    plan: pro ? 'pro' : 'free',
    weeks: pro ? 2 : 1,
    tiers: pro ? ['guided', 'standard', 'expert'] : ['guided', 'standard'],
    voiceDefend: true,
  };
}
