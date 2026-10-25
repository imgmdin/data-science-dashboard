"use client";

import { useState } from "react";
import { CertificateFrame } from "@/lib/certificate/Certificate";
import { TEMPLATES, getTemplate } from "@/lib/certificate/templates";
import type { CertificateInput, CertificateRecord } from "@/lib/certificates";

const SIGNATORY_DEFAULTS = {
  leftName: "Dr Ayesha Hakim",
  leftRole: "Incharge DSS",
  rightName: "Syed Ghulam Mohiuddin",
  rightRole: "President DSS",
};

function fromTemplate(templateId: string): CertificateInput {
  const t = getTemplate(templateId);
  return {
    templateId: t.id,
    name: "",
    description: "",
    title: t.title,
    statement: t.statement,
    event: t.event,
    badge: t.badge,
    ...SIGNATORY_DEFAULTS,
    leftSignature: "",
    rightSignature: "",
    published: false,
  };
}

/** Downscale a signature image so it stays small enough to store (keeps transparency). */
function readSignature(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      reject(new Error("Use a PNG, JPEG or WebP image."));
      return;
    }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 700 / img.width, 240 / img.height);
      const c = document.createElement("canvas");
      c.width = Math.round(img.width * k);
      c.height = Math.round(img.height * k);
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL("image/png"));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("That image could not be read."));
    };
    img.src = url;
  });
}

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-800">{label}</span>
      {children}
      {hint ? <span className="mt-1 block text-xs text-slate-600">{hint}</span> : null}
    </label>
  );
}

export function CertificateEditor({
  initial,
  onClose,
}: {
  initial: CertificateRecord | null;
  onClose: (changed: boolean) => void;
}) {
  const [form, setForm] = useState<CertificateInput>(() =>
    initial ? { ...initial } : fromTemplate("course-completion"),
  );
  const [previewName, setPreviewName] = useState("Ayesha Khan");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CertificateInput>(k: K, v: CertificateInput[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  function pickTemplate(id: string) {
    // Carry over wording only if the user hasn't customised it away from the old template's defaults.
    setForm((f) => {
      const old = getTemplate(f.templateId);
      const next = getTemplate(id);
      return {
        ...f,
        templateId: id,
        title: f.title === old.title ? next.title : f.title,
        statement: f.statement === old.statement ? next.statement : f.statement,
        event: f.event === old.event ? next.event : f.event,
        badge: f.badge === old.badge ? next.badge : f.badge,
      };
    });
  }

  async function save() {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(initial ? `/api/certificates/${initial.id}` : "/api/certificates", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not save.");
      onClose(true);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial || !confirm(`Delete “${initial.name}”? Its public link will stop working.`)) return;
    const res = await fetch(`/api/certificates/${initial.id}`, { method: "DELETE" });
    if (res.ok) onClose(true);
    else setError("Could not delete.");
  }

  async function signature(side: "left" | "right", file: File | undefined) {
    if (!file) return;
    try {
      set(side === "left" ? "leftSignature" : "rightSignature", await readSignature(file));
      setError("");
    } catch (e) {
      setError((e as Error).message);
    }
  }

  const groups = [
    { label: "E-certificates (purple)", items: TEMPLATES.filter((t) => t.filled) },
    { label: "Formal certificates (white)", items: TEMPLATES.filter((t) => !t.filled) },
  ];

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => onClose(false)} className="mb-2 text-sm font-medium text-brand-700 hover:text-brand-900">
            ← All certificates
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-950">
            {initial ? "Edit certificate" : "New certificate"}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {initial ? (
            <button onClick={remove} className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50">
              Delete
            </button>
          ) : null}
          <button
            onClick={save}
            disabled={saving}
            className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-800 disabled:opacity-60"
          >
            {saving ? "Saving…" : form.published ? "Save and publish" : "Save draft"}
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid items-start gap-8 xl:grid-cols-[minmax(0,26rem)_minmax(0,1fr)]">
        <div className="space-y-6">
          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-brand-950">Listing</h2>
            <Field label="Internal name" hint="Shown on the public page and in this dashboard.">
              <input className={inputCls} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Python bootcamp 2026" />
            </Field>
            <Field label="Description" hint="Optional line under the name on the public page.">
              <input className={inputCls} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Who this certificate is for" />
            </Field>
            <label className="flex items-start gap-3 rounded-lg bg-brand-50 p-3">
              <input
                type="checkbox"
                checked={form.published}
                onChange={(e) => set("published", e.target.checked)}
                className="mt-0.5 h-4 w-4 accent-brand-700"
              />
              <span className="text-sm">
                <span className="font-medium text-slate-900">Published</span>
                <span className="block text-slate-600">Visible on the public page so people can download it.</span>
              </span>
            </label>
          </section>

          <section className="rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="mb-3 font-semibold text-brand-950">Design</h2>
            {groups.map((g) => (
              <fieldset key={g.label} className="mb-3 last:mb-0">
                <legend className="mb-2 text-xs font-medium text-slate-600">{g.label}</legend>
                <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2 xl:grid-cols-1">
                  {g.items.map((t) => (
                    <label
                      key={t.id}
                      className={`flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-colors has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-brand-500 ${
                        form.templateId === t.id ? "border-brand-600 bg-brand-50 font-medium" : "border-slate-200 hover:border-brand-300"
                      }`}
                    >
                      <input type="radio" name="template" className="sr-only" checked={form.templateId === t.id} onChange={() => pickTemplate(t.id)} />
                      <span aria-hidden="true" className={`h-3 w-3 shrink-0 rounded-full border ${t.filled ? "border-brand-900 bg-brand-900" : "border-brand-700 bg-white"}`} />
                      {t.name}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
          </section>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-brand-950">Wording</h2>
            <Field label="Certificate title" hint="Press Enter for a new line.">
              <textarea className={inputCls} rows={2} value={form.title} onChange={(e) => set("title", e.target.value)} />
            </Field>
            <Field label="Recognition sentence">
              <textarea className={inputCls} rows={2} value={form.statement} onChange={(e) => set("statement", e.target.value)} />
            </Field>
            <Field label="Event, programme or role">
              <textarea className={inputCls} rows={2} value={form.event} onChange={(e) => set("event", e.target.value)} />
            </Field>
            <Field label="Distinction label" hint="Optional, e.g. WINNER. Hidden when empty.">
              <input className={inputCls} value={form.badge} onChange={(e) => set("badge", e.target.value)} />
            </Field>
          </section>

          <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
            <h2 className="font-semibold text-brand-950">Signatories</h2>
            {(["left", "right"] as const).map((side) => {
              const nameKey = side === "left" ? "leftName" : "rightName";
              const roleKey = side === "left" ? "leftRole" : "rightRole";
              const sigKey = side === "left" ? "leftSignature" : "rightSignature";
              return (
                <div key={side} className="space-y-3 rounded-lg border border-slate-200 p-3">
                  <p className="text-xs font-medium text-slate-600">{side === "left" ? "Left" : "Right"} signature</p>
                  <input aria-label={`${side} name`} className={inputCls} value={form[nameKey]} onChange={(e) => set(nameKey, e.target.value)} />
                  <input aria-label={`${side} title`} className={inputCls} value={form[roleKey]} onChange={(e) => set(roleKey, e.target.value)} />
                  <div className="flex items-center gap-3">
                    <input
                      aria-label={`${side} signature image`}
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={(e) => signature(side, e.target.files?.[0])}
                      className="min-w-0 flex-1 text-xs text-slate-700 file:mr-3 file:rounded-md file:border-0 file:bg-brand-100 file:px-3 file:py-2 file:text-xs file:font-medium file:text-brand-900"
                    />
                    {form[sigKey] ? (
                      <button type="button" onClick={() => set(sigKey, "")} className="text-xs font-medium text-red-700 hover:underline">
                        Remove
                      </button>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </section>
        </div>

        <aside className="xl:sticky xl:top-6">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <h2 className="font-semibold text-brand-950">Live preview</h2>
              <label className="flex items-center gap-2 text-sm text-slate-700">
                Sample name
                <input className={`${inputCls} w-52 py-1.5`} value={previewName} onChange={(e) => setPreviewName(e.target.value)} />
              </label>
            </div>
            <div className="overflow-hidden rounded-lg border border-slate-200 bg-slate-100">
              <CertificateFrame data={{ ...form, recipient: previewName || "Recipient name" }} />
            </div>
            <p className="mt-3 text-xs text-slate-600">
              On the public page, the recipient name is typed in by the person downloading the certificate.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
