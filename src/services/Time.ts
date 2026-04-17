/**
 * Converts an ISO date string to a human-readable relative time string.
 * e.g. "2026-04-12T09:09:43.455Z" → "5 days ago"
 */
export function formatPostedAt(isoString: string): string {
  if (!isoString) return "";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString; // not a valid date — return as-is

  const diffMs  = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs  / 1_000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr  = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr  / 24);
  const diffMo  = Math.floor(diffDay / 30);
  const diffYr  = Math.floor(diffDay / 365);

  if (diffSec < 60)  return "just now";
  if (diffMin < 60)  return `${diffMin} minute${diffMin !== 1 ? "s" : ""} ago`;
  if (diffHr  < 24)  return `${diffHr} hour${diffHr !== 1 ? "s" : ""} ago`;
  if (diffDay < 30)  return `${diffDay} day${diffDay !== 1 ? "s" : ""} ago`;
  if (diffMo  < 12)  return `${diffMo} month${diffMo !== 1 ? "s" : ""} ago`;
  return `${diffYr} year${diffYr !== 1 ? "s" : ""} ago`;
}