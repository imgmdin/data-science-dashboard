
"use client";

import Image from "next/image";

import { useState } from "react";

const menuItems = [
  "Overview",
  "Members",
  "Events & Activities",
  "Attendance",
  "Certificates",
  "Forms",
];

const stats = [
  { label: "Total Members", value: "248", note: "+12 this month", icon: "👥" },
  { label: "Upcoming Events", value: "06", note: "Next event in 3 days", icon: "📅" },
  { label: "Attendance Rate", value: "86%", note: "Across recent events", icon: "✓" },
  { label: "Certificates", value: "124", note: "Issued to participants", icon: "🏆" },
];

const events = [
  { name: "Introduction to Machine Learning", date: "28 Oct 2026", status: "Upcoming" },
  { name: "Data Visualization Workshop", date: "02 Nov 2026", status: "Registration Open" },
  { name: "Data Science Project Showcase", date: "08 Nov 2026", status: "Planning" },
];

export default function Home() {
  const [activePage, setActivePage] = useState("Overview");

  return (
    <main className="min-h-screen bg-violet-50 text-slate-900 md:flex">
      <aside className="w-full bg-slate-950 p-5 text-white md:min-h-screen md:w-64">
        
        <div className="mb-9 flex items-center gap-3">
          <Image
  src="/DSS_Logo.png"
  alt="Data Science Society Logo"
  width={64}
  height={64}
  className="rounded-xl object-contain"
/>
        <div>
          <div className="text-xl font-bold">DataSphere</div>
          <div className="mt-1 text-xs text-violet-200">
            Data Science Society
          </div>
        </div>
      </div>


        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-slate-500">
          Workspace
        </p>

       
<nav className="flex flex-wrap gap-2 md:flex-col">
  {menuItems.map((item) => {
    const routes: Record<string, string> = {
      Overview: "/",
      Members: "/members",
      "Events & Activities": "/events",
      Attendance: "/attendance",
    };

    return (
      <button
        key={item}
        onClick={() => {
          const route = routes[item];

          if (route) {
            window.location.href = route;
          } else {
            setActivePage(item);
          }
        }}
        className={`rounded-lg px-4 py-3 text-left text-sm transition ${
          activePage === item
            ? "bg-blue-600 text-white"
            : "text-slate-300 hover:bg-slate-800"
        }`}
      >
        {item}
      </button>
    );
  })}
</nav>


        <div className="mt-10 rounded-xl border border-slate-800 p-4">
          <p className="font-medium">Society workspace</p>
          <p className="mt-2 text-xs leading-5 text-slate-400">
            Manage your community, activities, and achievements in one place.
          </p>
        </div>
      </aside>

      <section className="min-w-0 flex-1 p-5 md:p-9">
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-slate-500">Data Science Society / Workspace</p>
            <h1 className="mt-2 text-3xl font-bold">{activePage}</h1>
            <p className="mt-2 text-sm text-slate-500">
              Welcome back! Here&apos;s your society at a glance.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              aria-label="Notifications"
              className="rounded-xl border border-slate-200 bg-white px-4 py-3"
            >
              🔔
            </button>
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-100 font-bold text-blue-700">
              DS
            </div>
          </div>
        </header>

        {activePage === "Overview" ? (
          <>
            <div className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
              {stats.map((stat) => (
                <div
                  key={stat.label}
                  className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between
                  ">
                    <p className="text-sm text-slate-500">{stat.label}</p>
                    <span className="text-xl">{stat.icon}</span>
                  </div>
                  <p className="mt-4 text-3xl font-bold">{stat.value}</p>
                  <p className="mt-2 text-xs text-emerald-600">{stat.note}</p>
                </div>
              ))}
            </div>

            <div className="grid gap-6 xl:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 xl:col-span-2">
                <div className="mb-6 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">Upcoming Events</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      Keep track of society activities
                    </p>
                  </div>
                  <button
                    onClick={() => setActivePage("Events & Activities")}
                    className="text-sm font-medium text-blue-600 hover:text-blue-800"
                  >
                    View all →
                  </button>
                </div>

                <div className="space-y-4">
                  {events.map((event) => (
                    <div
                      key={event.name}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-slate-100 p-4"
                    >
                      <div>
                        <p className="font-semibold">{event.name}</p>
                        <p className="mt-1 text-sm text-slate-500">{event.date}</p>
                      </div>
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                        {event.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-6">
                <h2 className="text-lg font-bold">Quick Actions</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Jump into a workspace
                </p>

                <div className="mt-5 space-y-3">
                  {[
                    ["＋", "Manage Members", "Members"],
                    ["＋", "Create an Event", "Events & Activities"],
                    ["✓", "Record Attendance", "Attendance"],
                    ["✧", "Manage Certificates", "Certificates"],
                    ["▤", "Manage Forms", "Forms"],
                  ].map(([icon, label, page]) => (
                    <button
                      key={page}
                      onClick={() => setActivePage(page)}
                      className="flex w-full items-center gap-3 rounded-xl border border-slate-200 p-3 text-left text-sm font-medium hover:border-blue-300 hover:bg-blue-50"
                    >
                      <span className="text-lg text-blue-600">{icon}</span>
                      {label}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-8">
            <h2 className="text-xl font-bold">{activePage}</h2>
            <p className="mt-2 text-slate-500">
              This workspace is ready for its next UI module. Database
              integration will be added separately.
            </p>
            <button
              onClick={() => setActivePage("Overview")}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              Back to Overview
            </button>
          </div>
        )}

        <footer className="mt-8 text-center text-xs text-slate-400">
          DataSphere · Data Science Society · Dashboard Preview
        </footer>
      </section>
    </main>
  );
}
