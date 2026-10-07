export const OPEN_MINUTE = 600; // 10:00
export const CLOSE_MINUTE = 1320; // 22:00
export const LUNCH_START = 810; // 13:30
export const LUNCH_END = 870; // 14:30

export const SALON_TIMEZONE = "America/Santiago";

export type Interval = { start: number; end: number };
export type BusyInterval = { busy_date: string; start_minute: number; end_minute: number };

export function formatMinute(minute: number): string {
  const h = Math.floor(minute / 60);
  const m = minute % 60;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}

export function formatDuration(minutes: number): string {
  const h = minutes / 60;
  return h === 1 ? "1 hora" : `${h} horas`;
}

function overlaps(a: Interval, b: Interval): boolean {
  return a.start < b.end && a.end > b.start;
}

/** Candidate start times for a service duration, respecting opening hours and lunch. */
export function candidateStarts(durationMinutes: number): number[] {
  const step = durationMinutes;
  const result: number[] = [];
  for (let start = OPEN_MINUTE; start + durationMinutes <= CLOSE_MINUTE; start += step) {
    const candidate = { start, end: start + durationMinutes };
    if (overlaps(candidate, { start: LUNCH_START, end: LUNCH_END })) continue;
    result.push(start);
  }
  return result;
}

/** Slots that don't collide with any confirmed booking or manual block. */
export function availableStarts(
  durationMinutes: number,
  busy: Interval[],
  minStartMinute = 0,
): number[] {
  return candidateStarts(durationMinutes).filter((start) => {
    if (start < minStartMinute) return false;
    const candidate = { start, end: start + durationMinutes };
    return !busy.some((b) => overlaps(candidate, b));
  });
}

/** yyyy-mm-dd for a date, in the salon timezone. */
export function salonDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: SALON_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export function salonNow(): { dateKey: string; minute: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: SALON_TIMEZONE,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);
  const hour = Number(parts.find((p) => p.type === "hour")?.value ?? "0");
  const minute = Number(parts.find((p) => p.type === "minute")?.value ?? "0");
  return { dateKey: salonDateKey(now), minute: hour * 60 + minute };
}

export function dateKeyToLocalDate(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y!, (m ?? 1) - 1, d ?? 1);
}

export function addDaysKey(key: string, days: number): string {
  const d = dateKeyToLocalDate(key);
  d.setDate(d.getDate() + days);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export function formatLongDate(key: string): string {
  return new Intl.DateTimeFormat("es-CL", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(dateKeyToLocalDate(key));
}

export function groupBusyByDate(rows: BusyInterval[]): Record<string, Interval[]> {
  const map: Record<string, Interval[]> = {};
  for (const row of rows) {
    const list = map[row.busy_date] ?? (map[row.busy_date] = []);
    list.push({ start: row.start_minute, end: row.end_minute });
  }
  return map;
}
