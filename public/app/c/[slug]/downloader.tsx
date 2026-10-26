"use client";

import { useEffect, useRef, useState } from "react";
import { CertificateFrame } from "@/lib/certificate/Certificate";
import { downloadPdf, downloadPng, safeFilename } from "@/lib/export";
import type { PublicCertificate } from "@/lib/certificates";

export function Downloader({ cert }: { cert: PublicCertificate }) {
  const paper = useRef<HTMLElement>(null);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState<"pdf" | "png" | null>(null);
  const [error, setError] = useState("");
  // Buttons stay disabled until hydration, so an early click cannot submit the form natively.
  const [ready, setReady] = useState(false);
  useEffect(() => setReady(true), []);

  const trimmed = name.trim();

  async function download(kind: "pdf" | "png") {
    if (!trimmed) {
      setError("Enter your name first.");
      document.getElementById("recipient-name")?.focus();
      return;
    }
    if (!paper.current) return;
    setError("");
    setBusy(kind);
    try {
      const file = `${safeFilename(cert.name)}-${safeFilename(trimmed)}`;
      await (kind === "pdf" ? downloadPdf(paper.current, file) : downloadPng(paper.current, file));
      fetch(`/api/certificates/${cert.slug}/download`, { method: "POST" }).catch(() => {});
    } catch {
      setError("Something went wrong creating your file. Please try again.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mt-8 grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="overflow-hidden rounded-xl border border-brand-100 bg-white p-3 md:p-4">
        <CertificateFrame data={{ ...cert, recipient: trimmed || "Your name" }} paperRef={paper} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          download("pdf");
        }}
        className="rounded-xl border border-brand-100 bg-white p-5 lg:sticky lg:top-6"
      >
        <label htmlFor="recipient-name" className="block text-sm font-medium text-slate-800">
          Your name
        </label>
        <input
          id="recipient-name"
          value={name}
          maxLength={60}
          autoComplete="name"
          onChange={(e) => {
            setName(e.target.value);
            setError("");
          }}
          placeholder="As it should appear"
          aria-describedby="name-help"
          className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-3 text-base placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
        />
        <p id="name-help" className="mt-1.5 text-xs text-slate-600">
          Check the spelling in the preview. The certificate is created from exactly what you type.
        </p>

        {error ? (
          <p role="alert" className="mt-3 text-sm font-medium text-red-700">
            {error}
          </p>
        ) : null}

        <div className="mt-5 grid gap-2.5">
          <button
            type="submit"
            disabled={busy !== null || !ready}
            className="rounded-lg bg-brand-700 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {busy === "pdf" ? "Preparing PDF…" : "Download PDF"}
          </button>
          <button
            type="button"
            onClick={() => download("png")}
            disabled={busy !== null || !ready}
            className="rounded-lg border border-brand-300 bg-white px-4 py-3 text-sm font-semibold text-brand-800 transition-colors hover:bg-brand-50 disabled:opacity-60"
          >
            {busy === "png" ? "Preparing image…" : "Download PNG"}
          </button>
        </div>
      </form>
    </div>
  );
}
