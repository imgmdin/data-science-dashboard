import { sql } from "./db";
import { getTemplate } from "./certificate/templates";

export type CertificateRecord = {
  id: string;
  slug: string;
  templateId: string;
  name: string;
  description: string;
  title: string;
  statement: string;
  event: string;
  badge: string;
  leftName: string;
  leftRole: string;
  rightName: string;
  rightRole: string;
  leftSignature: string;
  rightSignature: string;
  published: boolean;
  downloadCount: number;
  updatedAt: string;
};

export type CertificateInput = Omit<CertificateRecord, "id" | "slug" | "downloadCount" | "updatedAt">;

type Row = Record<string, unknown>;

function toRecord(r: Row): CertificateRecord {
  return {
    id: r.id as string,
    slug: r.slug as string,
    templateId: r.template_id as string,
    name: r.name as string,
    description: r.description as string,
    title: r.title as string,
    statement: r.statement as string,
    event: r.event as string,
    badge: r.badge as string,
    leftName: r.left_name as string,
    leftRole: r.left_role as string,
    rightName: r.right_name as string,
    rightRole: r.right_role as string,
    leftSignature: r.left_signature as string,
    rightSignature: r.right_signature as string,
    published: r.published as boolean,
    downloadCount: r.download_count as number,
    updatedAt: new Date(r.updated_at as string).toISOString(),
  };
}

const LIMITS = { short: 200, long: 600, signature: 400_000 } as const;

function str(v: unknown, max: number, fallback = ""): string {
  return typeof v === "string" ? v.slice(0, max) : fallback;
}

/** Validates untrusted JSON from the editor. Returns an error string or a clean input. */
export function parseInput(body: unknown): CertificateInput | string {
  if (!body || typeof body !== "object") return "Invalid body";
  const b = body as Record<string, unknown>;
  const templateId = getTemplate(str(b.templateId, 80)).id;
  const name = str(b.name, LIMITS.short).trim();
  const title = str(b.title, LIMITS.short).trim();
  if (!name) return "Give the certificate an internal name.";
  if (!title) return "The certificate needs a title.";
  const sig = (v: unknown) => {
    const s = str(v, LIMITS.signature + 1);
    if (s === "") return "";
    return /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(s) && s.length <= LIMITS.signature ? s : null;
  };
  const leftSignature = sig(b.leftSignature);
  const rightSignature = sig(b.rightSignature);
  if (leftSignature === null || rightSignature === null) return "Signature must be a PNG, JPEG or WebP image under 400 KB.";
  return {
    templateId,
    name,
    description: str(b.description, LIMITS.long).trim(),
    title,
    statement: str(b.statement, LIMITS.long).trim(),
    event: str(b.event, LIMITS.long).trim(),
    badge: str(b.badge, 60).trim(),
    leftName: str(b.leftName, LIMITS.short).trim(),
    leftRole: str(b.leftRole, LIMITS.short).trim(),
    rightName: str(b.rightName, LIMITS.short).trim(),
    rightRole: str(b.rightRole, LIMITS.short).trim(),
    leftSignature,
    rightSignature,
    published: b.published === true,
  };
}

function slugify(s: string) {
  const base = s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 48) || "certificate";
  return `${base}-${Math.random().toString(36).slice(2, 7)}`;
}

export async function listCertificates(): Promise<CertificateRecord[]> {
  const rows = await sql()`SELECT * FROM certificates ORDER BY updated_at DESC`;
  return rows.map(toRecord);
}

export async function getCertificate(id: string): Promise<CertificateRecord | null> {
  const rows = await sql()`SELECT * FROM certificates WHERE id = ${id}::uuid`;
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function createCertificate(i: CertificateInput): Promise<CertificateRecord> {
  const rows = await sql()`
    INSERT INTO certificates (slug, template_id, name, description, title, statement, event, badge,
      left_name, left_role, right_name, right_role, left_signature, right_signature, published)
    VALUES (${slugify(i.name)}, ${i.templateId}, ${i.name}, ${i.description}, ${i.title}, ${i.statement}, ${i.event}, ${i.badge},
      ${i.leftName}, ${i.leftRole}, ${i.rightName}, ${i.rightRole}, ${i.leftSignature}, ${i.rightSignature}, ${i.published})
    RETURNING *`;
  return toRecord(rows[0]);
}

export async function updateCertificate(id: string, i: CertificateInput): Promise<CertificateRecord | null> {
  const rows = await sql()`
    UPDATE certificates SET template_id = ${i.templateId}, name = ${i.name}, description = ${i.description},
      title = ${i.title}, statement = ${i.statement}, event = ${i.event}, badge = ${i.badge},
      left_name = ${i.leftName}, left_role = ${i.leftRole}, right_name = ${i.rightName}, right_role = ${i.rightRole},
      left_signature = ${i.leftSignature}, right_signature = ${i.rightSignature},
      published = ${i.published}, updated_at = now()
    WHERE id = ${id}::uuid RETURNING *`;
  return rows[0] ? toRecord(rows[0]) : null;
}

export async function deleteCertificate(id: string): Promise<boolean> {
  const rows = await sql()`DELETE FROM certificates WHERE id = ${id}::uuid RETURNING id`;
  return rows.length > 0;
}

// ---- Public page copy, edited from the dashboard ----

export type SiteSettings = { heading: string; intro: string };
export const DEFAULT_SETTINGS: SiteSettings = {
  heading: "Events, workshops and competitions",
  intro: "Find what the Data Science Society is running, register in a minute, and collect your certificate afterwards.",
};

export async function getSettings(): Promise<SiteSettings> {
  const rows = await sql()`SELECT key, value FROM site_settings`;
  const m = Object.fromEntries(rows.map((r) => [r.key as string, r.value as string]));
  return { heading: m.heading ?? DEFAULT_SETTINGS.heading, intro: m.intro ?? DEFAULT_SETTINGS.intro };
}

export async function saveSettings(s: SiteSettings) {
  const q = sql();
  await q`INSERT INTO site_settings (key, value) VALUES ('heading', ${s.heading.slice(0, 120)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
  await q`INSERT INTO site_settings (key, value) VALUES ('intro', ${s.intro.slice(0, 400)})
          ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`;
}
