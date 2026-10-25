
"use client";

import { useMemo, useState } from "react";

type Member = {
  id: number;
  name: string;
  email: string;
  role: string;
  status: "Active" | "Pending" | "Inactive";
};

const initialMembers: Member[] = [
  { id: 1, name: "Ayesha Khan", email: "ayesha@example.com", role: "President", status: "Active" },
  { id: 2, name: "Ali Ahmed", email: "ali@example.com", role: "Vice President", status: "Active" },
  { id: 3, name: "Sara Malik", email: "sara@example.com", role: "Event Coordinator", status: "Active" },
  { id: 4, name: "Hamza Shah", email: "hamza@example.com", role: "General Member", status: "Pending" },
  { id: 5, name: "Fatima Noor", email: "fatima@example.com", role: "General Member", status: "Inactive" },
];

export default function MembersPage() {
  const [members, setMembers] = useState(initialMembers);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("General Member");

  const filteredMembers = useMemo(() => {
    return members.filter((member) => {
      const matchesSearch =
        member.name.toLowerCase().includes(search.toLowerCase()) ||
        member.email.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || member.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [members, search, statusFilter]);

  const activeCount = members.filter((m) => m.status === "Active").length;
  const pendingCount = members.filter((m) => m.status === "Pending").length;

  function addMember(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setMembers((current) => [
      ...current,
      {
        id: Date.now(),
        name: name.trim(),
        email: email.trim(),
        role,
        status: "Pending",
      },
    ]);

    setName("");
    setEmail("");
    setRole("General Member");
    setShowForm(false);
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 md:p-9">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Society Management / Members</p>
          <h1 className="mt-2 text-3xl font-bold">Members</h1>
          <p className="mt-2 text-sm text-slate-500">
            Manage your society community and membership records.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Add Member
        </button>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Members", value: members.length },
          { label: "Active Members", value: activeCount },
          { label: "Pending Approval", value: pendingCount },
        ].map((stat) => (
          <div key={stat.label} className="rounded-2xl border border-slate-200 bg-white p-5">
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </section>

      {showForm && (
        <form onSubmit={addMember} className="mb-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h2 className="mb-4 text-lg font-bold">Add a member</h2>

          <div className="grid gap-4 md:grid-cols-3">
            <input
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              className="rounded-lg border border-slate-300 px-3 py-3"
            />
            <input
              required
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email address"
              className="rounded-lg border border-slate-300 px-3 py-3"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-3"
            >
              <option>General Member</option>
              <option>President</option>
              <option>Vice President</option>
              <option>Event Coordinator</option>
              <option>Technical Lead</option>
            </select>
          </div>

          <div className="mt-4 flex gap-3">
            <button type="submit" className="rounded-lg bg-blue-600 px-4 py-2 text-white">
              Save Member
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-lg border px-4 py-2">
              Cancel
            </button>
          </div>
        </form>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 md:p-6">
        <div className="mb-5 flex flex-col gap-3 md:flex-row">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option>All</option>
            <option>Active</option>
            <option>Pending</option>
            <option>Inactive</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500">
                <th className="px-3 py-4 font-medium">Member</th>
                <th className="px-3 py-4 font-medium">Role</th>
                <th className="px-3 py-4 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((member) => (
                <tr key={member.id} className="border-b border-slate-100 last:border-0">
                  <td className="px-3 py-4">
                    <p className="font-semibold">{member.name}</p>
                    <p className="mt-1 text-xs text-slate-500">{member.email}</p>
                  </td>
                  <td className="px-3 py-4">{member.role}</td>
                  <td className="px-3 py-4">
                    <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                      member.status === "Active"
                        ? "bg-emerald-50 text-emerald-700"
                        : member.status === "Pending"
                        ? "bg-amber-50 text-amber-700"
                        : "bg-slate-100 text-slate-600"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                </tr>
              ))}

              {filteredMembers.length === 0 && (
                <tr>
                  <td colSpan={3} className="px-3 py-10 text-center text-slate-500">
                    No members found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <p className="mt-4 text-sm text-slate-500">
          Showing {filteredMembers.length} of {members.length} members
        </p>
      </section>

      <p className="mt-5 text-xs text-slate-400">
        Demo data only · Members added here are not saved to a database.
      </p>
    </main>
  );
}
