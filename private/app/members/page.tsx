"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Member } from "@/lib/member-types";

const STATUS_STYLE: Record<Member["status"], string> = {
  Active: "bg-emerald-50 text-emerald-800",
  Pending: "bg-amber-50 text-amber-900",
  Inactive: "bg-slate-100 text-slate-700",
};

const inputCls =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-500 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-200";

type Draft = Omit<Member, "id">;
const EMPTY: Draft = { name: "", email: "", role: "General Member", department: "", status: "Active", isCabinet: false };

export default function MembersPage() {
  const [members, setMembers] = useState<Member[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/members");
      const body = await res.json();
      if (!res.ok) throw new Error(body.error);
      setMembers(body);
      setError("");
    } catch (e) {
      setError((e as Error).message || "Could not load members.");
      setMembers([]);
    }
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, [load]);

  const filtered = useMemo(
    () =>
      (members ?? []).filter((m) => {
        const q = search.toLowerCase();
        const matchesSearch = m.name.toLowerCase().includes(q) || m.email.toLowerCase().includes(q) || m.role.toLowerCase().includes(q);
        return matchesSearch && (statusFilter === "All" || m.status === statusFilter);
      }),
    [members, search, statusFilter],
  );

  function open(m: Member | "new") {
    setError("");
    if (m === "new") {
      setDraft(EMPTY);
      setEditing("new");
    } else {
      const { id, ...rest } = m;
      setDraft(rest);
      setEditing(id);
    }
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      const res = await fetch(editing === "new" ? "/api/members" : `/api/members/${editing}`, {
        method: editing === "new" ? "POST" : "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? "Could not save.");
      setEditing(null);
      await load();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  async function remove(m: Member) {
    if (!confirm(`Remove ${m.name} from the member list?`)) return;
    const res = await fetch(`/api/members/${m.id}`, { method: "DELETE" });
    if (res.ok) load();
    else setError("Could not remove the member.");
  }

  const all = members ?? [];
  const stats = [
    ["Members", all.length],
    ["Active", all.filter((m) => m.status === "Active").length],
    ["Pending approval", all.filter((m) => m.status === "Pending").length],
    ["Cabinet", all.filter((m) => m.isCabinet).length],
  ];

  return (
    <main className="mx-auto max-w-6xl">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-brand-950">Members</h1>
          <p className="mt-1 text-slate-600">The society’s member register. Cabinet members appear in meeting attendance.</p>
        </div>
        <button onClick={() => open("new")} className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800">
          Add member
        </button>
      </header>

      {error ? (
        <p role="alert" className="mb-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {error}
        </p>
      ) : null}

      <section aria-label="Summary" className="mb-6 grid grid-cols-2 overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-4 lg:divide-x lg:divide-slate-200">
        {stats.map(([label, value], i) => (
          <div key={label} className={`p-5 ${i >= 2 ? "border-t border-slate-200 lg:border-t-0" : ""} ${i % 2 === 1 ? "border-l border-slate-200 lg:border-l-0" : ""}`}>
            <p className="text-sm text-slate-600">{label}</p>
            <p className="mt-1 text-2xl font-semibold tabular-nums text-brand-950">{value}</p>
          </div>
        ))}
      </section>

      {editing ? (
        <form onSubmit={save} className="mb-6 rounded-xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-semibold text-brand-950">{editing === "new" ? "Add a member" : "Edit member"}</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <label className="block text-sm font-medium text-slate-800">
              Full name
              <input required className={`${inputCls} mt-1.5`} value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Email
              <input type="email" className={`${inputCls} mt-1.5`} value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Role
              <input className={`${inputCls} mt-1.5`} value={draft.role} onChange={(e) => setDraft({ ...draft, role: e.target.value })} placeholder="e.g. General Secretary" />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Department and year
              <input className={`${inputCls} mt-1.5`} value={draft.department} onChange={(e) => setDraft({ ...draft, department: e.target.value })} />
            </label>
            <label className="block text-sm font-medium text-slate-800">
              Status
              <select className={`${inputCls} mt-1.5`} value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as Member["status"] })}>
                <option>Active</option>
                <option>Pending</option>
                <option>Inactive</option>
              </select>
            </label>
            <label className="flex items-center gap-3 self-end rounded-lg bg-brand-50 p-3 text-sm">
              <input type="checkbox" className="h-4 w-4 accent-brand-700" checked={draft.isCabinet} onChange={(e) => setDraft({ ...draft, isCabinet: e.target.checked })} />
              <span>
                <span className="font-medium text-slate-900">Cabinet member</span>
                <span className="block text-slate-600">Included in cabinet meeting attendance.</span>
              </span>
            </label>
          </div>
          <div className="mt-5 flex gap-3">
            <button disabled={saving} className="rounded-lg bg-brand-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 disabled:opacity-60">
              {saving ? "Saving…" : "Save member"}
            </button>
            <button type="button" onClick={() => setEditing(null)} className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-100">
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="mb-4 flex flex-wrap gap-3">
        <input aria-label="Search members" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by name, email or role" className={`${inputCls} max-w-xs`} />
        <select aria-label="Filter by status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={`${inputCls} w-auto`}>
          <option>All</option>
          <option>Active</option>
          <option>Pending</option>
          <option>Inactive</option>
        </select>
      </div>

      {members === null ? (
        <p className="text-slate-600">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-xl border border-dashed border-brand-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold text-brand-950">{all.length === 0 ? "No members yet" : "No members match"}</h2>
          <p className="mx-auto mt-1 max-w-md text-slate-600">
            {all.length === 0 ? "Add your cabinet and members to start tracking meeting attendance." : "Try a different search or filter."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 text-slate-600">
              <tr>
                <th className="px-5 py-3 font-medium">Name</th>
                <th className="px-5 py-3 font-medium">Role</th>
                <th className="px-5 py-3 font-medium">Department</th>
                <th className="px-5 py-3 font-medium">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((m) => (
                <tr key={m.id}>
                  <td className="px-5 py-3.5">
                    <p className="font-medium text-slate-900">{m.name}</p>
                    <p className="text-xs text-slate-600">{m.email || "No email"}</p>
                  </td>
                  <td className="px-5 py-3.5 text-slate-800">
                    {m.role}
                    {m.isCabinet ? <span className="ml-2 rounded-full bg-brand-100 px-2 py-0.5 text-xs font-medium text-brand-900">Cabinet</span> : null}
                  </td>
                  <td className="px-5 py-3.5 text-slate-700">{m.department || "—"}</td>
                  <td className="px-5 py-3.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLE[m.status]}`}>{m.status}</span>
                  </td>
                  <td className="space-x-3 px-5 py-3.5 text-right">
                    <button onClick={() => open(m)} className="text-sm font-medium text-brand-700 hover:text-brand-900">
                      Edit
                    </button>
                    <button onClick={() => remove(m)} className="text-sm font-medium text-red-700 hover:underline">
                      Remove
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
