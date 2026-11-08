// Modest leftovers of the moderation era: Home V1 has no posting, but the
// under-18 privacy rule still applies anywhere a name could appear (leaderboard
// consent). Everything posting-specific was deleted with the feed.

/** Minor protection: under-18 students never surface names or pictures in
 *  public contexts (leaderboards, feeds that may return one day). */
export function isMinor(profile) {
  const year = profile?.birthYear || profile?.birth_year;
  if (!year) return false;
  return new Date().getFullYear() - Number(year) < 18;
}
