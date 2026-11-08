// Voice answer scoring — computed purely by code, never by opinion
// (PRD §10: "The AI writes and explains; code checks and scores").
// Four honest signals: key-point coverage, answer length, speaking pace,
// and filler-word rate. No audio is ever read here — transcript in, numbers out.

const FILLERS = /\b(um+|uh+|erm|basically|actually|literally|you know|i mean|sort of|kind of|at the end of the day)\b/gi;

const clampPct = (n) => Math.max(0, Math.min(100, Math.round(n)));

export function scoreVoiceAnswer(spec, transcript, seconds) {
  const text = String(transcript || '').toLowerCase();
  const words = text.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  const keyPoints = Array.isArray(spec?.keyPoints) ? spec.keyPoints : [];
  const hit = [];
  const missed = [];
  for (const kp of keyPoints) {
    const found = (kp.aliases || []).some((al) => text.includes(String(al).toLowerCase()));
    (found ? hit : missed).push(kp.point);
  }
  const coverageScore = keyPoints.length ? hit.length / keyPoints.length : 0.5;

  const target = Number.isFinite(spec?.targetWords) ? spec.targetWords : 80;
  const lengthScore = Math.min(1, wordCount / target);

  const spokenSeconds = Math.max(0, Number(seconds) || 0);
  const wpm = spokenSeconds > 10 ? Math.round(wordCount / (spokenSeconds / 60)) : null;
  let paceScore = 0.6; // unknown duration → neutral, never punitive
  if (wpm !== null) {
    if (wpm >= 90 && wpm <= 175) paceScore = 1;
    else paceScore = Math.max(0, 1 - Math.abs(wpm < 90 ? 90 - wpm : wpm - 175) / 90);
  }

  const fillers = (text.match(FILLERS) || []).length;
  const fillerScore = 1 - Math.min(1, fillers / Math.max(1, wordCount) / 0.06);

  const score = clampPct(100 * (0.6 * coverageScore + 0.15 * lengthScore + 0.1 * paceScore + 0.15 * fillerScore));

  return {
    score,
    keyPointsTotal: keyPoints.length,
    keyPointsHit: hit.length,
    hitPoints: hit,
    missedPoints: missed,
    wordCount,
    targetWords: target,
    wpm,
    fillers,
  };
}
