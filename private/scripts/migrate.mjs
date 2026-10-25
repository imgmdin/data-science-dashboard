// Creates the tables the dashboard and public site share. Safe to re-run.
// Usage: npm run db:migrate   (reads DATABASE_URL from .env.local)
import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Put your Neon connection string in .env.local");
  process.exit(1);
}
const sql = neon(process.env.DATABASE_URL);

await sql`
  CREATE TABLE IF NOT EXISTS certificates (
    id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug            text UNIQUE NOT NULL,
    template_id     text NOT NULL,
    name            text NOT NULL,
    description     text NOT NULL DEFAULT '',
    title           text NOT NULL,
    statement       text NOT NULL,
    event           text NOT NULL,
    badge           text NOT NULL DEFAULT '',
    left_name       text NOT NULL,
    left_role       text NOT NULL,
    right_name      text NOT NULL,
    right_role      text NOT NULL,
    left_signature  text NOT NULL DEFAULT '',
    right_signature text NOT NULL DEFAULT '',
    published       boolean NOT NULL DEFAULT false,
    download_count  integer NOT NULL DEFAULT 0,
    created_at      timestamptz NOT NULL DEFAULT now(),
    updated_at      timestamptz NOT NULL DEFAULT now()
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS site_settings (
    key   text PRIMARY KEY,
    value text NOT NULL
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS events (
    id                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    slug                  text UNIQUE NOT NULL,
    title                 text NOT NULL,
    category              text NOT NULL DEFAULT 'Event',
    summary               text NOT NULL DEFAULT '',
    description           text NOT NULL DEFAULT '',
    start_at              timestamptz NOT NULL,
    end_at                timestamptz NOT NULL,
    registration_deadline timestamptz,
    venue                 text NOT NULL DEFAULT '',
    mode                  text NOT NULL DEFAULT 'in-person',
    join_url              text NOT NULL DEFAULT '',
    capacity              integer,
    agenda                text NOT NULL DEFAULT '',
    speakers              text NOT NULL DEFAULT '',
    recap                 text NOT NULL DEFAULT '',
    certificate_id        uuid REFERENCES certificates(id) ON DELETE SET NULL,
    published             boolean NOT NULL DEFAULT false,
    created_at            timestamptz NOT NULL DEFAULT now(),
    updated_at            timestamptz NOT NULL DEFAULT now()
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS registrations (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    event_id    uuid NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    name        text NOT NULL,
    email       text NOT NULL,
    department  text NOT NULL DEFAULT '',
    created_at  timestamptz NOT NULL DEFAULT now()
  )`;
await sql`CREATE UNIQUE INDEX IF NOT EXISTS registrations_event_email ON registrations (event_id, lower(email))`;
await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS attended_at timestamptz`;
await sql`ALTER TABLE registrations ADD COLUMN IF NOT EXISTS source text NOT NULL DEFAULT 'portal'`;
await sql`
  CREATE TABLE IF NOT EXISTS members (
    id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name        text NOT NULL,
    email       text NOT NULL DEFAULT '',
    role        text NOT NULL DEFAULT 'General Member',
    department  text NOT NULL DEFAULT '',
    status      text NOT NULL DEFAULT 'Active',
    is_cabinet  boolean NOT NULL DEFAULT false,
    created_at  timestamptz NOT NULL DEFAULT now()
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS meetings (
    id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    title      text NOT NULL,
    quorum     integer NOT NULL,
    status     text NOT NULL DEFAULT 'open',
    held_at    timestamptz NOT NULL DEFAULT now(),
    closed_at  timestamptz
  )`;
await sql`
  CREATE TABLE IF NOT EXISTS meeting_attendance (
    meeting_id uuid NOT NULL REFERENCES meetings(id) ON DELETE CASCADE,
    member_id  uuid NOT NULL REFERENCES members(id) ON DELETE CASCADE,
    status     text NOT NULL DEFAULT 'Absent',
    PRIMARY KEY (meeting_id, member_id)
  )`;
console.log("Database ready: certificates, site_settings, events, registrations, members, meetings");
