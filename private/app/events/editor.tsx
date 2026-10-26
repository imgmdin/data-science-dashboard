"use client";

import { useEffect, useState } from "react";
import { fromLocalInput, toLocalInput, formatWhen } from "@/lib/event-status";
import { CATEGORIES, MODES, type EventRecord, type Registration } from "@/lib/event-types";

type CertOption = { id: string; name: string; published: boolean };

type Form = {
  title: string;
  category: string;
  summary: string;
  description: string;
  start: string;
  end: string;
  deadline: string;
  venue: string;
  mode: string;
  joinUrl: string;
  capacity: string;
  agenda: string;
  speakers: string;
  recap: string;
  certificateId: string;
  published: boolean;
};

function toForm(e: EventRecord | null): Form {
  return {
    title: e?.title ?? "",
    category: e?.category ?? "Workshop",
    summary: e?.summary ?? "",
    description: e?.description ?? "",
    start: toLocalInput(e?.startAt ?? null),
    end: toLocalInput(e?.endAt ?? null),
    deadline: toLocalInput(e?.registrationDeadline ?? null),
    venue: e?.venue ?? "",
    mode: e?.mode ?? "in-person",
    joinUrl: e?.joinUrl ?? "",
    capacity: e?.capacity ? String(e.capacity) : "",
    agenda: e?.agenda ?? "",
    speakers: e?.speakers ?? "",
    recap: e?.recap ?? "",
    certificateId: e?.certificateId ?? "",
    published: e?.published ?? false,
  };
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

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5">
      <h2 className="font-semibold text-brand-950">{title}</h2>
      {children}
    </section>
  );
}

export function EventEditor({ initial, onClose }: { initial: EventRecord | null; onClose: (changed: boolean) => void }) {
  const [form, setForm] = useState<Form>(() => toForm(initial));
  const [certs, setCerts] = useState<CertOption[]>([]);
  const [regs, setRegs] = useState<Registration[] | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof Form>(k: K, v: Form[K]) => setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    fetch("/api/certificates")
      .then((r) => (r.ok ? r.json() : []))
      .then(setCerts)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (!initial) return;
    fetch(`/api/events/${initial.id}/registrations`)
      .then((r) => (r.ok ? r.json() : []))
      .then(setRegs)
      .catch(() => setRegs([]));
  }, [initial]);

  async function save() {
    const startAt = fromLocalInput(form.start);
    const endAt = fromLocalInput(form.end);
    if (!startAt || !endAt) return setError("Set a start and end time.");
    setSaving(true);
    setError("");
    const body = {
      ...form,
      startAt,
      endAt,
      registrationDeadline: form.deadline ? fromLocalInput(form.deadline) : null,
      capacity: form.capacity ? Number(form.capacity) : null,
      certificateId: form.certificateId || null,
    };
    try {
      const res = await fetch(initial ? `/api/events/${initial.id}` : "/api/events", {
        method: initial ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "Could not save.");
      onClose(true);
    } catch (e) {
      setError((e as Error).message);
      setSaving(false);
    }
  }

  async function remove() {
    if (!initial || !confirm(`Delete “${initial.title}” and its ${initial.registered} registration(s)?`)) return;
    const res = await fetch(`/api/events/${initial.id}`, { method: "DELETE" });
    if (res.ok) onClose(true);
    else setError("Could not delete.");
  }

  async function removeReg(id: string) {
    if (!initial || !confirm("Remove this registration?")) return;
    const res = await fetch(`/api/events/${initial.id}/registrations?rid=${id}`, { method: "DELETE" });
    if (res.ok) setRegs((r) => r?.filter((x) => x.id !== id) ?? null);
  }

  return (
    <div>
      <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <button onClick={() => onClose(false)} className="mb-2 text-sm font-medium text-brand-700 hover:text-brand-900">
            ← All events
          </button>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-950">{initial ? "Edit event" : "New event"}</h1>
        </div>
        <div className="flex items-center gap-3">
          {initial ? (
            <button onClick={remove} className="rounded-lg px-3 py-2.5 text-sm font-medium text-red-700 hover:bg-red-50">
              Delete
            </button>
          ) : null}
          <button onClick={save} disabled={saving} className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
            {saving ? "Saving…" : form.published ? "Save and publish" : "Save draft"}
          </button>
        </div>
      </header>

      {error ? (
        <p role="alert" className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          <Section title="Basics">
            <Field label="Title">
              <input className={inputCls} value={form.title} onChange={(e) => set("title", e.target.value)} placeholder="e.g. Introduction to Machine Learning" />
            </Field>
            <Field label="Type">
              <select className={inputCls} value={form.category} onChange={(e) => set("category", e.target.value)}>
                {CATEGORIES.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="One-line summary" hint="Shown in the event list.">
              <input className={inputCls} value={form.summary} onChange={(e) => set("summary", e.target.value)} />
            </Field>
            <Field label="Description" hint="What attendees will do or learn. Blank lines start a new paragraph.">
              <textarea className={inputCls} rows={6} value={form.description} onChange={(e) => set("description", e.target.value)} />
            </Field>
            <label className="flex items-start gap-3 rounded-lg bg-brand-50 p-3">
              <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} className="mt-0.5 h-4 w-4 accent-brand-700" />
              <span className="text-sm">
                <span className="font-medium text-slate-900">Published</span>
                <span className="block text-slate-600">Visible on the Society Portal. Its status (open, ongoing, concluded) follows the dates below.</span>
              </span>
            </label>
          </Section>

          <Section title="When and where">
            <p className="-mt-2 text-xs text-slate-600">All times are Pakistan time (PKT).</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Starts">
                <input type="datetime-local" className={inputCls} value={form.start} onChange={(e) => set("start", e.target.value)} />
              </Field>
              <Field label="Ends">
                <input type="datetime-local" className={inputCls} value={form.end} onChange={(e) => set("end", e.target.value)} />
              </Field>
            </div>
            <Field label="Registration closes" hint="Optional. Defaults to the start time.">
              <input type="datetime-local" className={inputCls} value={form.deadline} onChange={(e) => set("deadline", e.target.value)} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Format">
                <select className={inputCls} value={form.mode} onChange={(e) => set("mode", e.target.value)}>
                  {MODES.map((m) => (
                    <option key={m} value={m}>
                      {m === "in-person" ? "In person" : m === "online" ? "Online" : "Hybrid"}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Capacity" hint="Leave empty for no limit.">
                <input type="number" min={1} className={inputCls} value={form.capacity} onChange={(e) => set("capacity", e.target.value)} />
              </Field>
            </div>
            <Field label="Venue">
              <input className={inputCls} value={form.venue} onChange={(e) => set("venue", e.target.value)} placeholder="e.g. Computer Lab 1, Faculty of Sciences" />
            </Field>
            <Field label="Join link" hint="For online or hybrid events. Shown to registered visitors while the event is on.">
              <input className={inputCls} value={form.joinUrl} onChange={(e) => set("joinUrl", e.target.value)} placeholder="https://meet.google.com/…" />
            </Field>
          </Section>
        </div>

        <div className="space-y-6">
          <Section title="Programme (optional)">
            <Field label="Agenda" hint="One item per line, e.g. “10:00 | Welcome and introductions”. Hidden when empty.">
              <textarea className={inputCls} rows={5} value={form.agenda} onChange={(e) => set("agenda", e.target.value)} />
            </Field>
            <Field label="Speakers" hint="One per line, e.g. “Dr Ayesha Hakim | Incharge, DSS”. Hidden when empty.">
              <textarea className={inputCls} rows={3} value={form.speakers} onChange={(e) => set("speakers", e.target.value)} />
            </Field>
          </Section>

          <Section title="After the event">
            <Field label="Recap" hint="Shown on the event page once it has concluded.">
              <textarea className={inputCls} rows={4} value={form.recap} onChange={(e) => set("recap", e.target.value)} />
            </Field>
            <Field label="Certificate" hint="Attendees can download it from the event page after it concludes. Only published certificates appear.">
              <select className={inputCls} value={form.certificateId} onChange={(e) => set("certificateId", e.target.value)}>
                <option value="">No certificate</option>
                {certs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.published ? "" : " (draft)"}
                  </option>
                ))}
              </select>
            </Field>
          </Section>

          {initial ? (
            <Section title={`Registrations${regs ? ` (${regs.length}${initial.capacity ? ` / ${initial.capacity}` : ""})` : ""}`}>
              {regs === null ? (
                <p className="text-sm text-slate-600">Loading…</p>
              ) : regs.length === 0 ? (
                <p className="text-sm text-slate-600">No one has registered yet.</p>
              ) : (
                <>
                  <a href={`/api/events/${initial.id}/registrations?format=csv`} className="inline-block text-sm font-medium text-brand-700 hover:text-brand-900">
                    Download CSV
                  </a>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                      <thead className="text-xs text-slate-600">
                        <tr>
                          <th className="py-2 pr-3 font-medium">Name</th>
                          <th className="py-2 pr-3 font-medium">Email</th>
                          <th className="py-2 pr-3 font-medium">Department</th>
                          <th className="py-2" />
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {regs.map((r) => (
                          <tr key={r.id}>
                            <td className="py-2 pr-3 font-medium">{r.name}</td>
                            <td className="py-2 pr-3 text-slate-700">{r.email}</td>
                            <td className="py-2 pr-3 text-slate-700">{r.department || "—"}</td>
                            <td className="py-2 text-right">
                              <button onClick={() => removeReg(r.id)} className="text-xs font-medium text-red-700 hover:underline">
                                Remove
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </Section>
          ) : null}

          {initial ? <p className="text-xs text-slate-600">Current schedule: {formatWhen(initial.startAt, initial.endAt)}</p> : null}
        </div>
      </div>
    </div>
  );
}
