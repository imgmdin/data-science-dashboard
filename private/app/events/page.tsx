
"use client";

import { useMemo, useState } from "react";

type SocietyEvent = {
  id: number;
  title: string;
  category: string;
  date: string;
  location: string;
  capacity: number;
  status: "Upcoming" | "Registration Open" | "Completed";
};

const initialEvents: SocietyEvent[] = [
  {
    id: 1,
    title: "Introduction to Machine Learning",
    category: "Workshop",
    date: "2026-10-28",
    location: "Computer Lab 1",
    capacity: 60,
    status: "Registration Open",
  },
  {
    id: 2,
    title: "Data Visualization with Python",
    category: "Training",
    date: "2026-11-02",
    location: "Seminar Hall",
    capacity: 80,
    status: "Upcoming",
  },
  {
    id: 3,
    title: "Data Science Project Showcase",
    category: "Competition",
    date: "2026-11-08",
    location: "Main Auditorium",
    capacity: 120,
    status: "Upcoming",
  },
  {
    id: 4,
    title: "AI & Society Seminar",
    category: "Seminar",
    date: "2026-10-15",
    location: "Conference Room",
    capacity: 50,
    status: "Completed",
  },
];

export default function EventsPage() {
  const [events, setEvents] = useState(initialEvents);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Workshop");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [capacity, setCapacity] = useState("50");

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.category.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "All" || event.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [events, search, statusFilter]);

  const upcomingCount = events.filter(
    (event) => event.status !== "Completed"
  ).length;

  function addEvent(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    setEvents((current) => [
      {
        id: Date.now(),
        title: title.trim(),
        category,
        date,
        location: location.trim(),
        capacity: Number(capacity),
        status: "Upcoming",
      },
      ...current,
    ]);

    setTitle("");
    setCategory("Workshop");
    setDate("");
    setLocation("");
    setCapacity("50");
    setShowForm(false);
  }

  function formatDate(dateString: string) {
    return new Date(`${dateString}T12:00:00`).toLocaleDateString(
      "en-GB",
      { day: "numeric", month: "short", year: "numeric" }
    );
  }

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 md:p-9">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">
            Society Management / Events
          </p>
          <h1 className="mt-2 text-3xl font-bold">Events & Activities</h1>
          <p className="mt-2 text-sm text-slate-500">
            Plan workshops, manage activities, and organize society events.
          </p>
        </div>

        <button
          onClick={() => setShowForm(!showForm)}
          className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
        >
          + Create Event
        </button>
      </header>

      <section className="mb-6 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Total Events", value: events.length },
          { label: "Upcoming / Open", value: upcomingCount },
          {
            label: "Completed",
            value: events.filter((event) => event.status === "Completed").length,
          },
        ].map((stat) => (
          <div
            key={stat.label}
            className="rounded-2xl border border-slate-200 bg-white p-5"
          >
            <p className="text-sm text-slate-500">{stat.label}</p>
            <p className="mt-3 text-3xl font-bold">{stat.value}</p>
          </div>
        ))}
      </section>

      {showForm && (
        <form
          onSubmit={addEvent}
          className="mb-6 rounded-2xl border border-slate-200 bg-white p-6"
        >
          <h2 className="mb-4 text-lg font-bold">Create an event</h2>

          <div className="grid gap-4 md:grid-cols-2">
            <input
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Event title"
              className="rounded-lg border border-slate-300 px-3 py-3"
            />

            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-3"
            >
              <option>Workshop</option>
              <option>Training</option>
              <option>Seminar</option>
              <option>Competition</option>
              <option>Social Activity</option>
            </select>

            <input
              required
              type="date"
              min="2026-01-01"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-lg border border-slate-300 px-3 py-3"
            />

            <input
              required
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="Venue / location"
              className="rounded-lg border border-slate-300 px-3 py-3"
            />

            <input
              required
              type="number"
              min="1"
              value={capacity}
              onChange={(e) => setCapacity(e.target.value)}
              placeholder="Maximum participants"
              className="rounded-lg border border-slate-300 px-3 py-3"
            />
          </div>

          <div className="mt-4 flex gap-3">
            <button
              type="submit"
              className="rounded-lg bg-blue-600 px-4 py-2 text-white"
            >
              Save Event
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="rounded-lg border px-4 py-2"
            >
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
            placeholder="Search events or categories..."
            className="min-w-0 flex-1 rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-blue-500"
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-xl border border-slate-200 px-4 py-3"
          >
            <option>All</option>
            <option>Upcoming</option>
            <option>Registration Open</option>
            <option>Completed</option>
          </select>
        </div>

        <div className="space-y-4">
          {filteredEvents.map((event) => (
            <article
              key={event.id}
              className="rounded-xl border border-slate-200 p-5 transition hover:border-blue-200"
            >
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-wide text-blue-600">
                    {event.category}
                  </span>
                  <h2 className="mt-2 text-lg font-bold">{event.title}</h2>
                  <div className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-slate-500">
                    <span>📅 {formatDate(event.date)}</span>
                    <span>📍 {event.location}</span>
                    <span>👥 Capacity: {event.capacity}</span>
                  </div>
                </div>

                <span
                  className={`rounded-full px-3 py-1 text-xs font-medium ${
                    event.status === "Completed"
                      ? "bg-slate-100 text-slate-600"
                      : event.status === "Registration Open"
                      ? "bg-emerald-50 text-emerald-700"
                      : "bg-blue-50 text-blue-700"
                  }`}
                >
                  {event.status}
                </span>
              </div>
            </article>
          ))}

          {filteredEvents.length === 0 && (
            <p className="py-10 text-center text-slate-500">
              No events match your search.
            </p>
          )}
        </div>

        <p className="mt-5 text-xs text-slate-400">
          Demo events only · Changes are temporary and not stored in a database.
        </p>
      </section>
    </main>
  );
}
