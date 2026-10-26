import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { CertificateFrame } from "@/lib/certificate/Certificate";
import { listPublished, type PublicCertificate } from "@/lib/certificates";

export const metadata = { title: "Certificates — Society Portal" };

export default function Certificates() {
  return (
    <Suspense fallback={<p className="px-5 py-16 text-center text-slate-600">Loading…</p>}>
      <Catalogue />
    </Suspense>
  );
}

async function Catalogue() {
  await connection();
  let certs: PublicCertificate[];
  try {
    certs = await listPublished();
  } catch {
    return (
      <main className="mx-auto max-w-xl px-5 py-24 text-center">
        <h1 className="text-2xl font-semibold text-brand-950">Certificates are unavailable right now</h1>
        <p className="mt-2 text-slate-600">Please try again in a few minutes.</p>
      </main>
    );
  }

  return (
    <main>
      <section className="bg-[#220668] text-white">
        <div className="mx-auto max-w-6xl px-5 pb-10 pt-8 md:pb-14 md:pt-12">
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">Certificates</h1>
          <p className="mt-3 max-w-xl text-lg text-brand-200">Choose your certificate, enter your name exactly as you want it printed, and download it as a PDF or image.</p>
        </div>
      </section>

      <section aria-label="Available certificates" className="mx-auto max-w-6xl px-5 py-12">
        {certs.length === 0 ? (
          <p className="rounded-xl border border-dashed border-brand-300 bg-white p-10 text-center text-slate-600">No certificates are available yet. Check back after an event concludes.</p>
        ) : (
          <ul className="grid gap-6 [grid-template-columns:repeat(auto-fit,minmax(min(100%,22rem),1fr))]">
            {certs.map((c) => (
              <li key={c.slug}>
                <Link href={`/c/${c.slug}`} className="group block overflow-hidden rounded-xl border border-brand-100 bg-white transition-colors hover:border-brand-400">
                  <div className="border-b border-brand-100 bg-brand-50 p-3">
                    <CertificateFrame data={{ ...c, recipient: "Your name" }} />
                  </div>
                  <div className="flex items-center justify-between gap-4 p-5">
                    <div className="min-w-0">
                      <h2 className="truncate text-lg font-semibold text-brand-950">{c.name}</h2>
                      {c.description ? <p className="mt-0.5 line-clamp-2 text-sm text-slate-600">{c.description}</p> : null}
                    </div>
                    <span className="shrink-0 rounded-lg bg-brand-700 px-4 py-2 text-sm font-semibold text-white group-hover:bg-brand-800">Get certificate</span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
