// Shared by the dashboard and the public portal (keep both copies identical).
// Society events run in Pakistan (UTC+5, no daylight saving), so a fixed offset is enough.
export const TZ = "Asia/Karachi";
const OFFSET = "+05:00";

export type EventTiming = {
  startAt: string;
  endAt: string;
  registrationDeadline: string | null;
  capacity: number | null;
  registered: number;
};

export type Phase = "open" | "scheduled" | "ongoing" | "concluded";

export type EventStatus = {
  phase: Phase;
  label: string;
  registrationOpen: boolean;
  full: boolean;
  spotsLeft: number | null;
};

/** Event status is derived from its dates; nobody sets it by hand. */
export function eventStatus(e: EventTiming, now = new Date()): EventStatus {
  const t = now.getTime();
  const start = new Date(e.startAt).getTime();
  const end = new Date(e.endAt).getTime();
  const deadline = e.registrationDeadline ? new Date(e.registrationDeadline).getTime() : start;
  const spotsLeft = e.capacity === null ? null : Math.max(0, e.capacity - e.registered);
  const full = spotsLeft === 0;

  if (t > end) return { phase: "concluded", label: "Concluded", registrationOpen: false, full, spotsLeft };
  if (t >= start) return { phase: "ongoing", label: "Happening now", registrationOpen: false, full, spotsLeft };
  if (t <= deadline && !full) return { phase: "open", label: "Registration open", registrationOpen: true, full, spotsLeft };
  return { phase: "scheduled", label: full ? "Fully booked" : "Registration closed", registrationOpen: false, full, spotsLeft };
}

const fmt = (o: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat("en-GB", { timeZone: TZ, ...o });

export const formatDate = (iso: string) => fmt({ weekday: "short", day: "numeric", month: "long", year: "numeric" }).format(new Date(iso));
export const formatTime = (iso: string) => fmt({ hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(iso));
export const formatMonth = (iso: string) => fmt({ month: "short" }).format(new Date(iso));
export const formatDay = (iso: string) => fmt({ day: "numeric" }).format(new Date(iso));
export const formatYear = (iso: string) => fmt({ year: "numeric" }).format(new Date(iso));

function dayKey(iso: string) {
  return fmt({ year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date(iso));
}

/** "Wed, 28 October 2026 · 10:00 am – 1:00 pm" (adds the end date when it differs). */
export function formatWhen(startAt: string, endAt: string) {
  const sameDay = dayKey(startAt) === dayKey(endAt);
  return sameDay
    ? `${formatDate(startAt)} · ${formatTime(startAt)} – ${formatTime(endAt)}`
    : `${formatDate(startAt)}, ${formatTime(startAt)} – ${formatDate(endAt)}, ${formatTime(endAt)}`;
}

/** ISO → value for <input type="datetime-local"> in the society timezone. */
export function toLocalInput(iso: string | null) {
  if (!iso) return "";
  const parts = Object.fromEntries(
    fmt({ year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hourCycle: "h23" })
      .formatToParts(new Date(iso))
      .map((p) => [p.type, p.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
}

/** <input type="datetime-local"> value (society timezone) → ISO string. */
export function fromLocalInput(v: string) {
  const d = new Date(`${v}:00${OFFSET}`);
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}
