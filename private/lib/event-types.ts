// Client-safe event types and constants (no database imports).
export const CATEGORIES = ["Workshop", "Seminar", "Training", "Competition", "Webinar", "Meetup", "Other"] as const;
export const MODES = ["in-person", "online", "hybrid"] as const;

export type EventRecord = {
  id: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description: string;
  startAt: string;
  endAt: string;
  registrationDeadline: string | null;
  venue: string;
  mode: string;
  joinUrl: string;
  capacity: number | null;
  agenda: string;
  speakers: string;
  recap: string;
  certificateId: string | null;
  published: boolean;
  registered: number;
};

export type EventInput = Omit<EventRecord, "id" | "slug" | "registered">;

export type Registration = {
  id: string;
  name: string;
  email: string;
  department: string;
  createdAt: string;
  attendedAt: string | null;
  source: string;
};
