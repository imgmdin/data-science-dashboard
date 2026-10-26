"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { eventStatus, formatDate, formatWhen } from "@/lib/event-status";
import type { EventRecord, Registration } from "@/lib/event-types";
import type { Member } from "@/lib/member-types";
import { ATTENDANCE_STATUSES, type AttendanceStatus, type Meeting, type MeetingDetail } from "@/lib/meeting-types";

import { PUBLIC_URL } from "../brand";

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";
const panel = "rounded-xl border border-slate-200 bg-white p-5 md:p-6";

type Tab = "cabinet" | "events";

async function api<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? "Request failed.");
  return body as T;
}
const post = (body: unknown): RequestInit => ({ method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const put = (body: unknown): RequestInit => ({ method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
const patch = (body: unknown): RequestInit => ({ method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

export default function AttendancePage() {
  const [tab, setTab] = useState<Tab>("cabinet");

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-8">
        <h1 className="text-3xl font-semibold tracking-tight text-brand-950">Attendance</h1>
        <p className="mt-1 text-slate-600">Cabinet meetings and event check-ins, saved to the society’s records.</p>
      </header>

      <div role="tablist" aria-label="Attendance type" className="mb-7 flex gap-2">
        {([["cabinet", "Cabinet meetings"], ["events", "Event check-in"]] as [Tab, string][]).map(([id, label]) => (
          <button
            key={id}
            role="tab"
            aria-selected={tab === id}
            onClick={() => setTab(id)}
            className={`rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors ${tab === id ? "bg-brand-700 text-white" : "bg-white text-slate-700 ring-1 ring-slate-300 hover:ring-brand-300"}`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "cabinet" ? <CabinetTab /> : <EventsTab />}
    </main>
  );
}

/* ---------------------------------- Cabinet ---------------------------------- */

function CabinetTab() {
  const [meetings, setMeetings] = useState<Meeting[] | null>(null);
  const [cabinetSize, setCabinetSize] = useState<number | null>(null);
  const [active, setActive] = useState<MeetingDetail | null>(null);
  const [title, setTitle] = useState("Cabinet meeting");
  const [quorum, setQuorum] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      const [list, members] = await Promise.all([api<Meeting[]>("/api/meetings"), api<Member[]>("/api/members")]);
      const size = members.filter((m) => m.isCabinet && m.status !== "Inactive").length;
      setMeetings(list);
      setCabinetSize(size);
      setQuorum((q) => q || String(Math.floor(size / 2) + 1));
      const open = list.find((m) => m.status === "open");
      setActive(open ? await api<MeetingDetail>(`/api/meetings/${open.id}`) : null);
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setMeetings([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  async function start(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api("/api/meetings", post({ title, quorum: Number(quorum) }));
      await load();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  async function mark(memberId: string, status: AttendanceStatus) {
    if (!active) return;
    setActive({ ...active, attendance: active.attendance.map((a) => (a.memberId === memberId ? { ...a, status } : a)) });
    try {
      await api(`/api/meetings/${active.id}/attendance`, put({ memberId, status }));
    } catch (err) {
      setError((err as Error).message);
    }
    load();
  }

  async function close() {
    if (!active || !confirm("Close this meeting? The attendance record will be locked.")) return;
    await api(`/api/meetings/${active.id}`, { method: "PATCH" }).catch((e) => setError(e.message));
    load();
  }

  async function remove(m: Meeting) {
    if (!confirm(`Delete the record of “${m.title}”?`)) return;
    await api(`/api/meetings/${m.id}`, { method: "DELETE" }).catch((e) => setError(e.message));
    load();
  }

  if (meetings === null) return <p className="text-slate-600">Loading…</p>;

  const present = active?.attendance.filter((a) => a.status === "Present").length ?? 0;
  const quorumMet = active ? present >= active.quorum : false;
  const history = meetings.filter((m) => m.status === "closed");

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      {cabinetSize === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-brand-950">No cabinet members yet</h2>
          <p className="mx-auto mt-1 max-w-md text-slate-600">Mark members as “Cabinet member” on the Members page and they will appear here when you start a meeting.</p>
          <a href="/members" className="mt-5 inline-block rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
            Go to Members
          </a>
        </div>
      ) : active ? (
        <section className={panel}>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold text-brand-950">{active.title}</h2>
              <p className="mt-0.5 text-sm text-slate-600">Started {formatWhen(active.heldAt, active.heldAt).split(" · ")[0]} · tick each member as they join</p>
            </div>
            <div className="flex items-center gap-3">
              <span className={`rounded-lg px-3 py-2 text-sm font-semibold ${quorumMet ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                {quorumMet ? "Quorum met" : "Quorum not met"} · {present}/{active.quorum}
              </span>
              <button onClick={close} className="rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
                Close meeting
              </button>
            </div>
          </div>
          <div className="mt-5 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 pr-4 font-medium">Member</th>
                  <th className="py-3 pr-4 font-medium">Role</th>
                  <th className="py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {active.attendance.map((a) => (
                  <tr key={a.memberId}>
                    <td className="py-3 pr-4 font-medium text-slate-900">{a.name}</td>
                    <td className="py-3 pr-4 text-slate-700">{a.role}</td>
                    <td className="py-3">
                      <div role="group" aria-label={`Status for ${a.name}`} className="inline-flex overflow-hidden rounded-lg ring-1 ring-slate-300">
                        {ATTENDANCE_STATUSES.map((s) => (
                          <button
                            key={s}
                            onClick={() => mark(a.memberId, s)}
                            aria-pressed={a.status === s}
                            className={`px-3 py-1.5 text-xs font-semibold transition-colors ${
                              a.status === s
                                ? s === "Present" ? "bg-emerald-600 text-white" : s === "Excused" ? "bg-amber-500 text-white" : "bg-slate-700 text-white"
                                : "bg-white text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <form onSubmit={start} className={panel}>
          <h2 className="text-lg font-semibold text-brand-950">Start a cabinet meeting</h2>
          <p className="mt-1 text-sm text-slate-600">
            All {cabinetSize} active cabinet members are added, marked absent until you record them. Quorum defaults to a majority.
          </p>
          <div className="mt-5 grid gap-4 md:grid-cols-[1fr_10rem_auto] md:items-end">
            <label className="block text-sm font-medium text-slate-800">
              Meeting title
              <input required className={`${inputCls} mt-1.5`} value={title} onChange={(e) => setTitle(e.target.value)} />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Quorum
              <input required type="number" min={1} className={`${inputCls} mt-1.5`} value={quorum} onChange={(e) => setQuorum(e.target.value)} />
            </label>
            <button className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">Start meeting</button>
          </div>
        </form>
      )}

      <section className={panel}>
        <h2 className="text-lg font-semibold text-brand-950">Past meetings</h2>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">Closed meetings are kept here with their attendance.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 text-slate-600">
                <tr>
                  <th className="py-3 pr-4 font-medium">Meeting</th>
                  <th className="py-3 pr-4 font-medium">Date</th>
                  <th className="py-3 pr-4 font-medium">Present</th>
                  <th className="py-3 pr-4 font-medium">Quorum</th>
                  <th className="py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((m) => (
                  <tr key={m.id}>
                    <td className="py-3 pr-4 font-medium text-slate-900">{m.title}</td>
                    <td className="py-3 pr-4 text-slate-700">{formatDate(m.heldAt)}</td>
                    <td className="py-3 pr-4 tabular-nums text-slate-700">
                      {m.present}/{m.total}
                      {m.excused ? ` · ${m.excused} excused` : ""}
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${m.present >= m.quorum ? "bg-emerald-50 text-emerald-800" : "bg-amber-50 text-amber-900"}`}>
                        {m.present >= m.quorum ? "Met" : "Not met"} ({m.quorum})
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <button onClick={() => remove(m)} className="text-xs font-medium text-red-700 hover:underline">
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

/* ----------------------------------- Events ----------------------------------- */

function EventsTab() {
  const [events, setEvents] = useState<EventRecord[] | null>(null);
  const [eventId, setEventId] = useState("");
  const [regs, setRegs] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [walk, setWalk] = useState({ name: "", email: "", department: "" });
  const [error, setError] = useState("");

  useEffect(() => {
    api<EventRecord[]>("/api/events")
      .then((list) => {
        const usable = list.filter((e) => e.published);
        setEvents(usable);
        const now = usable.find((e) => eventStatus(e).phase === "ongoing") ?? [...usable].reverse().find((e) => eventStatus(e).phase !== "concluded") ?? usable[0];
        if (now) setEventId(now.id);
      })
      .catch((e) => {
        setError(e.message);
        setEvents([]);
      });
  }, []);

  const loadRegs = useCallback(async () => {
    if (!eventId) return;
    try {
      setRegs(await api<Registration[]>(`/api/events/${eventId}/registrations`));
    } catch (e) {
      setError((e as Error).message);
    }
  }, [eventId]);

  // Self check-ins from the portal arrive in the database, so refresh the list regularly.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadRegs();
    const t = setInterval(loadRegs, 10_000);
    return () => clearInterval(t);
  }, [loadRegs]);

  const event = events?.find((e) => e.id === eventId);
  const attended = regs.filter((r) => r.attendedAt).length;
  const walkIns = regs.filter((r) => r.source === "walk-in").length;
  const shown = useMemo(
    () => regs.filter((r) => `${r.name} ${r.email}`.toLowerCase().includes(search.toLowerCase())),
    [regs, search],
  );

  async function toggle(r: Registration) {
    await api(`/api/events/${eventId}/registrations`, patch({ rid: r.id, attended: !r.attendedAt })).catch((e) => setError(e.message));
    loadRegs();
  }

  async function addWalkIn(e: React.FormEvent) {
    e.preventDefault();
    try {
      await api(`/api/events/${eventId}/registrations`, post(walk));
      setWalk({ name: "", email: "", department: "" });
      setError("");
      loadRegs();
    } catch (err) {
      setError((err as Error).message);
    }
  }

  if (events === null) return <p className="text-slate-600">Loading…</p>;
  if (events.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-brand-300 bg-white p-10 text-center">
        <h2 className="text-lg font-semibold text-brand-950">No published events</h2>
        <p className="mx-auto mt-1 max-w-md text-slate-600">Publish an event and its registrations will appear here for check-in.</p>
        <a href="/events" className="mt-5 inline-block rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
          Go to Events
        </a>
      </div>
    );
  }

  const checkInUrl = event && PUBLIC_URL ? `${PUBLIC_URL}/events/${event.slug}/check-in` : "";
  const stats = [
    ["Registered", regs.length],
    ["Checked in", attended],
    ["Walk-ins", walkIns],
    ["Attendance rate", regs.length ? `${Math.round((attended / regs.length) * 100)}%` : "—"],
  ];

  return (
    <div className="space-y-6">
      {error ? (
        <p role="alert" className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <label className="block max-w-xl text-sm font-medium text-slate-800">
        Event
        <select className={`${inputCls} mt-1.5`} value={eventId} onChange={(e) => setEventId(e.target.value)}>
          {events.map((e) => (
            <option key={e.id} value={e.id}>
              {e.title} — {formatDate(e.startAt)}
            </option>
          ))}
        </select>
      </label>

      <section aria-label="Summary" className="grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-4 lg:divide-x lg:divide-slate-200">
        {stats.map(([label, value], i) => (
          <div key={label} className={`p-5 ${i >= 2 ? "border-t border-slate-200 lg:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-slate-200 lg:border-l-0" : ""}`}>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-950">{value}</p>
          </div>
        ))}
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[22rem_1fr]">
        <div className="space-y-6">
          <section className={panel}>
            <h2 className="text-lg font-semibold text-brand-950">Self check-in QR</h2>
            <p className="mt-1 text-sm text-slate-600">Show this at the door. Attendees scan it and confirm with the email they registered with.</p>
            {checkInUrl ? (
              <>
                <div className="mt-4 flex justify-center rounded-lg bg-slate-50 p-4">
                  <QRCodeSVG value={checkInUrl} size={200} level="H" marginSize={2} title={`Check-in QR code for ${event?.title}`} />
                </div>
                <p className="mt-3 break-all text-center text-xs text-slate-600">{checkInUrl}</p>
              </>
            ) : (
              <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">
                The QR code needs the public site address. Set NEXT_PUBLIC_PUBLIC_SITE_URL on this project and redeploy.
              </p>
            )}
            <p className="mt-2 text-xs leading-5 text-slate-600">
              Check-in opens one hour before the event starts and closes when it ends. The portal must be reachable from attendees’ phones.
            </p>
          </section>

          <form onSubmit={addWalkIn} className={panel}>
            <h2 className="text-lg font-semibold text-brand-950">Add a walk-in</h2>
            <p className="mt-1 text-sm text-slate-600">For people who turned up without registering. They are marked as checked in.</p>
            <div className="mt-4 space-y-3">
              <input required aria-label="Name" placeholder="Full name" className={inputCls} value={walk.name} onChange={(e) => setWalk({ ...walk, name: e.target.value })} />
              <input required type="email" aria-label="Email" placeholder="Email" className={inputCls} value={walk.email} onChange={(e) => setWalk({ ...walk, email: e.target.value })} />
              <input aria-label="Department" placeholder="Department and year (optional)" className={inputCls} value={walk.department} onChange={(e) => setWalk({ ...walk, department: e.target.value })} />
              <button className="w-full rounded-lg bg-brand-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">Add and check in</button>
            </div>
          </form>
        </div>

        <section className={panel}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-brand-950">Attendee list</h2>
            <a href={`/api/events/${eventId}/registrations?format=csv`} className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 hover:border-brand-300">
              Export CSV
            </a>
          </div>
          <input aria-label="Search attendees" placeholder="Search by name or email" className={`${inputCls} mb-4 max-w-xs`} value={search} onChange={(e) => setSearch(e.target.value)} />
          {shown.length === 0 ? (
            <p className="py-8 text-center text-sm text-slate-600">{regs.length === 0 ? "No one has registered for this event yet." : "No attendees match."}</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 text-slate-600">
                  <tr>
                    <th className="py-3 pr-4 font-medium">Attendee</th>
                    <th className="py-3 pr-4 font-medium">Department</th>
                    <th className="py-3 pr-4 font-medium">Status</th>
                    <th className="py-3" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {shown.map((r) => (
                    <tr key={r.id}>
                      <td className="py-3 pr-4">
                        <p className="font-medium text-slate-900">
                          {r.name}
                          {r.source === "walk-in" ? <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">Walk-in</span> : null}
                        </p>
                        <p className="text-xs text-slate-600">{r.email}</p>
                      </td>
                      <td className="py-3 pr-4 text-slate-700">{r.department || "—"}</td>
                      <td className="py-3 pr-4">
                        {r.attendedAt ? (
                          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                            Checked in {new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Karachi", hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(r.attendedAt))}
                          </span>
                        ) : (
                          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-700">Not yet</span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button onClick={() => toggle(r)} className="text-sm font-medium text-brand-700 hover:text-brand-900">
                          {r.attendedAt ? "Undo" : "Check in"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
