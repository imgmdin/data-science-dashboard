import { sql } from "./db";
import type { CertificateData } from "./certificate/Certificate";

/** What the public site is allowed to see of a certificate. Recipient name is entered by the visitor. */
export type PublicCertificate = Omit<CertificateData, "recipient"> & {
  slug: string;
  name: string;
  description: string;
};

type Row = Record<string, unknown>;

function toPublic(r: Row): PublicCertificate {
  return {
    slug: r.slug as string,
    name: r.name as string,
    description: r.description as string,
    templateId: r.template_id as string,
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
  };
}

export async function listPublished(): Promise<PublicCertificate[]> {
  const rows = await sql()`SELECT * FROM certificates WHERE published ORDER BY updated_at DESC`;
  return rows.map(toPublic);
}

export async function getPublished(slug: string): Promise<PublicCertificate | null> {
  const rows = await sql()`SELECT * FROM certificates WHERE published AND slug = ${slug}`;
  return rows[0] ? toPublic(rows[0]) : null;
}

export async function countDownload(slug: string): Promise<boolean> {
  const rows = await sql()`
    UPDATE certificates SET download_count = download_count + 1
    WHERE published AND slug = ${slug} RETURNING id`;
  return rows.length > 0;
}

export type SiteSettings = { heading: string; intro: string };

export async function getSettings(): Promise<SiteSettings> {
  const rows = await sql()`SELECT key, value FROM site_settings`;
  const m = Object.fromEntries(rows.map((r) => [r.key as string, r.value as string]));
  return {
    heading: m.heading ?? "Events, workshops and competitions",
    intro: m.intro ?? "Find what the Data Science Society is running, register in a minute, and collect your certificate afterwards.",
  };
}
