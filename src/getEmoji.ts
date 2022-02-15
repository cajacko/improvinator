/**
 * 0,5 = 100%
 * 0,1 = 100%
 * 1,1 = 0%
 * 1,2 = 50%
 * 2,1 = -50%
 */
export function getScore(negative: number, positive: number): number {
  if (negative === positive) return 0;
  if (negative === 0) return 1;
  if (positive === 0) return -1;

  const total = positive + negative;
  const value = positive - negative;

  return value / total;
}

function getEmoji(negative: number, positive: number): string {
  // const total = positive + negative;
  const score = getScore(negative, positive);

  if (score >= 1) return "😁";
  if (score >= 0.9) return "😃";
  if (score >= 0.6) return "😀";
  if (score >= 0.3) return "😊";
  if (score > 0) return "🙂";

  if (score === 0) return "😐";

  if (score <= -1) return "😭";
  if (score <= -0.9) return "😢";
  if (score <= -0.6) return "😨";
  if (score <= -0.3) return "😦";

  return "🙁";
}

export default getEmoji;
