import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import { getPublished } from "@/lib/certificates";
import { Downloader } from "./downloader";

export default function CertificatePage({ params }: PageProps<"/c/[slug]">) {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-slate-600">Loading…</p>}>
      <Certificate params={params} />
    </Suspense>
  );
}

async function Certificate({ params }: { params: PageProps<"/c/[slug]">["params"] }) {
  await connection();
  const { slug } = await params;
  let cert = null;
  try {
    cert = await getPublished(slug);
  } catch {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-950">This certificate is unavailable right now</h1>
        <p className="mt-2 text-slate-600">Please try again in a few minutes.</p>
      </main>
    );
  }
  if (!cert) notFound();

  return (
    <main className="mx-auto max-w-6xl px-5 py-8 md:py-12">
      <Link href="/certificates" className="text-sm font-medium text-brand-700 hover:text-brand-900">
        ← All certificates
      </Link>
      <h1 className="mt-3 text-3xl font-semibold tracking-tight text-brand-950 text-balance md:text-4xl">{cert.name}</h1>
      {cert.description ? <p className="mt-2 max-w-2xl text-lg text-slate-600">{cert.description}</p> : null}
      <Downloader cert={cert} />
    </main>
  );
}
