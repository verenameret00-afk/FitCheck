/** Week-based generation counter using localStorage. */
const STORAGE_KEY = "fitcheck_usage";
const FREE_LIMIT = 4;

interface UsageData {
  count: number;
  weekStart: string; // ISO date of the Monday for the recorded week
}

/** Get the ISO date string for the Monday of the current week. */
function getMondayOfWeek(date: Date): string {
  const d = new Date(date);
  const day = d.getDay(); // 0 = Sunday
  const diff = day === 0 ? -6 : 1 - day; // Shift to Monday
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d.toISOString().split("T")[0]!;
}

function readUsage(): UsageData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (
        typeof parsed.count === "number" &&
        typeof parsed.weekStart === "string"
      ) {
        return parsed as UsageData;
      }
    }
  } catch {
    // corrupted — reset
  }
  return { count: 0, weekStart: getMondayOfWeek(new Date()) };
}

function writeUsage(data: UsageData): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

/**
 * Call on app load to reset the counter if we're in a new week.
 * Safe to call multiple times — only resets when the stored weekStart
 * doesn't match the current Monday.
 */
export function resetIfNewWeek(): void {
  const data = readUsage();
  const currentMonday = getMondayOfWeek(new Date());
  if (data.weekStart !== currentMonday) {
    writeUsage({ count: 0, weekStart: currentMonday });
  }
}

/** How many generations have been used this week. */
export function getGenerationCount(): number {
  return readUsage().count;
}

/** Increment the counter by 1 and persist. */
export function incrementGenerationCount(): void {
  const data = readUsage();
  data.count += 1;
  writeUsage(data);
}

/** True when the free user has reached or exceeded the weekly limit. */
export function hasReachedLimit(): boolean {
  if (isPremium()) return false;
  return readUsage().count >= FREE_LIMIT;
}

/** Number of free generations remaining (0 when at/over limit). */
export function getRemainingGenerations(): number {
  return Math.max(0, FREE_LIMIT - readUsage().count);
}

/* ── Premium ── */

const PREMIUM_KEY = "fitcheck_premium";

export function isPremium(): boolean {
  try {
    return localStorage.getItem(PREMIUM_KEY) === "true";
  } catch {
    return false;
  }
}

/** Set premium status. For testing / post-payment simulation. */
export function unlockPremium(): void {
  localStorage.setItem(PREMIUM_KEY, "true");
}
