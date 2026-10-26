"use client";

import { useCallback, useEffect, useState } from "react";
import { CertificateFrame } from "@/lib/certificate/Certificate";
import { getTemplate } from "@/lib/certificate/templates";
import type { CertificateRecord } from "@/lib/certificates";
import { CertificateEditor } from "./editor";

import { PUBLIC_URL } from "../brand";

type Settings = { heading: string; intro: string };

export default function CertificatesPage() {
  const [rows, setRows] = useState<CertificateRecord[] | null>(null);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<CertificateRecord | "new" | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [settingsMsg, setSettingsMsg] = useState("");

  const load = useCallback(async () => {
    try {
      const [c, s] = await Promise.all([fetch("/api/certificates"), fetch("/api/settings")]);
      const cb = await c.json();
      if (!c.ok) throw new Error(cb.error);
      setRows(cb);
      if (s.ok) setSettings(await s.json());
      setError("");
    } catch (e) {
      setError((e as Error).message || "Could not load certificates.");
      setRows([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settings) return;
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    setSettingsMsg(res.ok ? "Saved." : "Could not save.");
  }

  async function togglePublish(c: CertificateRecord) {
    const res = await fetch(`/api/certificates/${c.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...c, published: !c.published }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Could not change the published state.");
      return;
    }
    load();
  }

  if (editing) {
    return (
      <main className="mx-auto max-w-7xl">
        <CertificateEditor
          initial={editing === "new" ? null : editing}
          onClose={(changed) => {
            setEditing(null);
            if (changed) load();
          }}
        />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-950">Certificates</h1>
          <p className="mt-1 text-slate-600">Design certificates here, publish them, and members download their own from the public page.</p>
        </div>
        <div className="flex items-center gap-3">
          {PUBLIC_URL ? (
            <a href={PUBLIC_URL} target="_blank" rel="noreferrer" className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-800 hover:border-brand-300">
              View public page
            </a>
          ) : null}
          <button onClick={() => setEditing("new")} className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800">
            New certificate
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
          {/DATABASE_URL/.test(error) ? " Create private/.env.local, then run npm run db:migrate." : ""}
        </p>
      ) : null}

      {rows === null ? (
        <p className="text-slate-600">Loading…</p>
      ) : rows.length === 0 && !error ? (
        <div className="rounded-xl border border-dashed border-brand-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-brand-950">No certificates yet</h2>
          <p className="mx-auto mt-1 max-w-md text-slate-600">Pick one of the 12 designs, set the title and wording, and publish it.</p>
          <button onClick={() => setEditing("new")} className="mt-5 rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            Create your first certificate
          </button>
        </div>
      ) : (
        <ul className="space-y-3">
          {rows.map((c) => (
            <li key={c.id} className="flex flex-wrap items-center gap-5 rounded-xl border border-slate-200 bg-white p-4">
              <button onClick={() => setEditing(c)} aria-label={`Edit ${c.name}`} className="w-48 shrink-0 overflow-hidden rounded-md border border-slate-200 text-left">
                <CertificateFrame data={{ ...c, recipient: "Recipient name" }} />
              </button>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h2 className="font-semibold text-brand-950">{c.name}</h2>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${c.published ? "bg-emerald-50 text-emerald-800" : "bg-slate-100 text-slate-700"}`}>
                    {c.published ? "Published" : "Draft"}
                  </span>
                </div>
                <p className="mt-0.5 text-sm text-slate-600">
                  {getTemplate(c.templateId).name} · {c.downloadCount} download{c.downloadCount === 1 ? "" : "s"}
                </p>
                {c.published && PUBLIC_URL ? (
                  <a href={`${PUBLIC_URL}/c/${c.slug}`} target="_blank" rel="noreferrer" className="mt-1 inline-block text-sm font-medium text-brand-700 hover:text-brand-900">
                    {PUBLIC_URL.replace(/^https?:\/\//, "")}/c/{c.slug}
                  </a>
                ) : null}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => togglePublish(c)} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:border-brand-300">
                  {c.published ? "Unpublish" : "Publish"}
                </button>
                <button onClick={() => setEditing(c)} className="rounded-lg bg-brand-50 px-3 py-2 text-sm font-medium text-brand-900 hover:bg-brand-100">
                  Edit
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {settings ? (
        <form onSubmit={saveSettings} className="mt-10 max-w-2xl rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="text-lg font-semibold text-brand-950">Portal home text</h2>
          <p className="mt-1 text-sm text-slate-600">The heading and introduction at the top of the Society Portal home page.</p>
          <label className="mt-4 block text-sm font-medium text-slate-800">
            Heading
            <input
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={settings.heading}
              onChange={(e) => setSettings({ ...settings, heading: e.target.value })}
            />
          </label>
          <label className="mt-4 block text-sm font-medium text-slate-800">
            Introduction
            <textarea
              rows={2}
              className="mt-1.5 w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200"
              value={settings.intro}
              onChange={(e) => setSettings({ ...settings, intro: e.target.value })}
            />
          </label>
          <div className="mt-4 flex items-center gap-3">
            <button className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">Save text</button>
            <span role="status" className="text-sm text-slate-600">{settingsMsg}</span>
          </div>
        </form>
      ) : null}
    </main>
  );
}
