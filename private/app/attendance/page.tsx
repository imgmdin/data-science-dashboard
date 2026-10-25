
"use client";

import { useEffect, useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { Html5QrcodeScanner } from "html5-qrcode";

type CabinetStatus = "Present" | "Absent" | "Excused";
type Tab = "cabinet" | "events";

type CabinetMember = {
  id: number;
  name: string;
  role: string;
  status: CabinetStatus;
};

type Attendee = {
  id: string;
  name: string;
  email: string;
  department: string;
  time: string;
};

const initialCabinet: CabinetMember[] = [
  { id: 1, name: "Ayesha Khan", role: "President", status: "Absent" },
  { id: 2, name: "Ali Ahmed", role: "Vice President", status: "Absent" },
  { id: 3, name: "Sara Malik", role: "General Secretary", status: "Absent" },
  { id: 4, name: "Hamza Shah", role: "Treasurer", status: "Absent" },
  { id: 5, name: "Fatima Noor", role: "Event Lead", status: "Absent" },
  { id: 6, name: "Usman Tariq", role: "Technical Lead", status: "Absent" },
  { id: 7, name: "Zara Ali", role: "Media Lead", status: "Absent" },
  { id: 8, name: "Ahmed Raza", role: "Research Lead", status: "Absent" },
  { id: 9, name: "Hira Aslam", role: "Membership Lead", status: "Absent" },
  { id: 10, name: "Bilal Hassan", role: "Operations Lead", status: "Absent" },
  { id: 11, name: "Maham Iqbal", role: "Design Lead", status: "Absent" },
  { id: 12, name: "Usama Khalid", role: "Workshop Lead", status: "Absent" },
  { id: 13, name: "Noor Fatima", role: "Content Lead", status: "Absent" },
  { id: 14, name: "Saad Malik", role: "Outreach Lead", status: "Absent" },
  { id: 15, name: "Maryam Shah", role: "Project Lead", status: "Absent" },
  { id: 16, name: "Hassan Ali", role: "Logistics Lead", status: "Absent" },
  { id: 17, name: "Amina Tariq", role: "Community Lead", status: "Absent" },
  { id: 18, name: "Daniyal Ahmed", role: "Events Coordinator", status: "Absent" },
  { id: 19, name: "Laiba Noor", role: "Partnerships Lead", status: "Absent" },
  { id: 20, name: "Omar Khan", role: "Cabinet Member", status: "Absent" },
];

export default function AttendancePage() {
  const [tab, setTab] = useState<Tab>("cabinet");
  const [cabinet, setCabinet] = useState(initialCabinet);
  const [meetingActive, setMeetingActive] = useState(false);
  const [meetingTitle, setMeetingTitle] = useState("Core Cabinet Meeting");
  const [quorumRequired, setQuorumRequired] = useState(11);
  const [eventName, setEventName] = useState("Data Science Workshop");
  const [eventCode, setEventCode] = useState("DS-2026-01");
  const [qrUrl, setQrUrl] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scannedValue, setScannedValue] = useState("");
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [attendeeName, setAttendeeName] = useState("");
  const [attendeeEmail, setAttendeeEmail] = useState("");
  const [attendeeDepartment, setAttendeeDepartment] = useState("");
  const [checkInMessage, setCheckInMessage] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");

  useEffect(() => {
  const url = new URL("/attendance", window.location.origin);
  url.searchParams.set("event", eventCode);
  url.hash = "event-check-in";

  requestAnimationFrame(() => {
    setQrUrl(url.toString());
  });
}, [eventCode]);

  useEffect(() => {
    if (!scannerOpen) return;

    let scanner: Html5QrcodeScanner | undefined;

    try {
      scanner = new Html5QrcodeScanner(
        "attendance-qr-reader",
        { fps: 10, qrbox: { width: 220, height: 220 } },
        false
      );

      scanner.render(
        (decodedText) => {
          setScannedValue(decodedText);
          setCheckInMessage("QR code scanned successfully.");
          setScannerOpen(false);
        },
        () => {}
      );
    } catch {
      console.error("Could not start the scanner. Check camera permissions.");
    }

    return () => {
      if (scanner) {
        void scanner.clear().catch(() => {});
      }
    };
  }, [scannerOpen]);

  const presentCount = cabinet.filter((m) => m.status === "Present").length;
  const absentCount = cabinet.filter((m) => m.status === "Absent").length;
  const excusedCount = cabinet.filter((m) => m.status === "Excused").length;
  const markedCount = presentCount + absentCount;
  const attendanceRate = markedCount
    ? Math.round((presentCount / markedCount) * 100)
    : 0;
  const quorumMet = meetingActive && presentCount >= quorumRequired;

  const filteredCabinet = useMemo(() => {
    return cabinet.filter((member) => {
      const matchesName = member.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === "All" || member.status === statusFilter;
      return matchesName && matchesStatus;
    });
  }, [cabinet, search, statusFilter]);

  function updateCabinetStatus(id: number, status: CabinetStatus) {
    setCabinet((current) =>
      current.map((member) => member.id === id ? { ...member, status } : member)
    );
  }

  function initiateMeeting() {
    setCabinet(initialCabinet);
    setMeetingActive(true);
  }

  function generateNewEventCode() {
    setEventCode(`DS-${Date.now().toString().slice(-8)}`);
    setAttendees([]);
    setCheckInMessage("");
  }

  function submitCheckIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const normalizedEmail = attendeeEmail.trim().toLowerCase();

    if (attendees.some((a) => a.email.toLowerCase() === normalizedEmail)) {
      setCheckInMessage("This email has already checked in for this event.");
      return;
    }

    const attendee: Attendee = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: attendeeName.trim(),
      email: normalizedEmail,
      department: attendeeDepartment.trim(),
      time: new Date().toLocaleString(),
    };

    setAttendees((current) => [attendee, ...current]);
    setAttendeeName("");
    setAttendeeEmail("");
    setAttendeeDepartment("");
    setCheckInMessage("Check-in recorded successfully!");
  }

  function exportCSV() {
    const headers = ["Name", "Email", "Department / Role", "Check-in Time"];
    const rows = attendees.map((a) => [a.name, a.email, a.department, a.time]);

    const escapeCSV = (value: string) =>
      `"${value.replace(/"/g, '""')}"`;

    const csv = [headers, ...rows]
      .map((row) => row.map(escapeCSV).join(","))
      .join("\r\n");

    const blob = new Blob(["\uFEFF" + csv], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${eventCode}-attendance.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none focus:border-blue-500";
  const cardClass = "rounded-2xl border border-slate-200 bg-white p-5 md:p-6";

  return (
    <main className="min-h-screen bg-slate-50 p-5 text-slate-900 md:p-9">
      <header className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-sm text-slate-500">Society Management / Attendance</p>
          <h1 className="mt-2 text-3xl font-bold">Attendance Management</h1>
          <p className="mt-2 text-sm text-slate-500">
            Cabinet meetings, event check-ins, and participation tracking.
          </p>
        </div>
        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-medium text-amber-800">
          Frontend demo
        </span>
      </header>

      <div className="mb-7 flex flex-wrap gap-3">
        <button
          onClick={() => setTab("cabinet")}
          className={`rounded-xl px-5 py-3 text-sm font-semibold ${
            tab === "cabinet" ? "bg-blue-600 text-white" : "border bg-white text-slate-600"
          }`}
        >
          Core Cabinet
        </button>
        <button
          onClick={() => setTab("events")}
          className={`rounded-xl px-5 py-3 text-sm font-semibold ${
            tab === "events" ? "bg-blue-600 text-white" : "border bg-white text-slate-600"
          }`}
        >
          QR Event Attendance
        </button>
      </div>

      {tab === "cabinet" && (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Cabinet Members", value: 20 },
              { label: "Present", value: presentCount },
              { label: "Attendance Rate", value: `${attendanceRate}%` },
              { label: "Excused", value: excusedCount },
            ].map((stat) => (
              <div key={stat.label} className={cardClass}>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-3 text-3xl font-bold">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className={`${cardClass} mb-6`}>
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold">Meeting control</h2>
                <p className="mt-1 text-sm text-slate-500">
                  Initiate a call, then record each member&apos;s status.
                </p>
              </div>
              <span className={`rounded-full px-3 py-2 text-xs font-semibold ${
                meetingActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-600"
              }`}>
                {meetingActive ? "Meeting active" : "No active meeting"}
              </span>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <div className="md:col-span-2">
                <label className="mb-2 block text-sm font-medium">Meeting title</label>
                <input
                  value={meetingTitle}
                  onChange={(e) => setMeetingTitle(e.target.value)}
                  className={inputClass}
                  placeholder="Meeting title"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">Quorum required</label>
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={quorumRequired}
                  onChange={(e) => setQuorumRequired(Math.max(1, Math.min(20, Number(e.target.value))))}
                  className={inputClass}
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                onClick={initiateMeeting}
                className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                {meetingActive ? "Reset & Call Meeting" : "Initiate / Call Meeting"}
              </button>
              <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${
                quorumMet ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-800"
              }`}>
                {meetingActive
                  ? quorumMet
                    ? `Quorum active · ${presentCount}/${quorumRequired} present`
                    : `Quorum not met · ${presentCount}/${quorumRequired} present`
                  : "Start meeting to activate quorum tracking"}
              </div>
            </div>
            {meetingActive && (
              <p className="mt-3 text-xs text-slate-500">
                {meetingTitle || "Untitled meeting"} · {new Date().toLocaleString()}
              </p>
            )}
          </section>

          <section className={cardClass}>
            <div className="mb-5">
              <h2 className="text-lg font-bold">Core Cabinet Register</h2>
              <p className="mt-1 text-sm text-slate-500">
                Restricted to authorized administrators in the production system.
              </p>
            </div>

            <div className="mb-5 grid gap-3 md:grid-cols-2">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search cabinet member..."
                className={inputClass}
              />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className={inputClass}
              >
                <option>All</option>
                <option>Present</option>
                <option>Absent</option>
                <option>Excused</option>
              </select>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="px-3 py-4 font-medium">Member</th>
                    <th className="px-3 py-4 font-medium">Role</th>
                    <th className="px-3 py-4 font-medium">Attendance status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCabinet.map((member) => (
                    <tr key={member.id} className="border-b border-slate-100 last:border-0">
                      <td className="px-3 py-4 font-semibold">{member.name}</td>
                      <td className="px-3 py-4 text-slate-600">{member.role}</td>
                      <td className="px-3 py-4">
                        <select
                          value={member.status}
                          disabled={!meetingActive}
                          onChange={(e) => updateCabinetStatus(member.id, e.target.value as CabinetStatus)}
                          className="rounded-lg border border-slate-200 bg-white px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
                        >
                          <option>Present</option>
                          <option>Absent</option>
                          <option>Excused</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-4 text-xs text-slate-400">
              {absentCount} absent · {excusedCount} excused · {presentCount} present.
              These are demo members, not your actual cabinet roster.
            </p>
          </section>
        </>
      )}

      {tab === "events" && (
        <>
          <section className="mb-6 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Event Check-ins", value: attendees.length },
              { label: "Unique Emails", value: new Set(attendees.map((a) => a.email)).size },
              { label: "Event Code", value: eventCode },
            ].map((stat) => (
              <div key={stat.label} className={cardClass}>
                <p className="text-sm text-slate-500">{stat.label}</p>
                <p className="mt-3 wrap-break-words text-2xl font-bold">{stat.value}</p>
              </div>
            ))}
          </section>

          <section className="mb-6 grid items-start gap-6 xl:grid-cols-2">
            <div className={cardClass}>
              <h2 className="text-lg font-bold">Event QR Generator</h2>
              <p className="mt-1 text-sm text-slate-500">
                Create a check-in QR code for your current event.
              </p>

              <label className="mb-2 mt-5 block text-sm font-medium">Event name</label>
              <input
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
                className={inputClass}
              />

              <label className="mb-2 mt-4 block text-sm font-medium">Event code</label>
              <input
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
                className={inputClass}
              />

              <div className="mt-6 flex flex-col items-center rounded-2xl bg-slate-50 p-5">
                {qrUrl && (
                  <QRCodeSVG
                    value={qrUrl}
                    size={210}
                    level="H"
                    includeMargin
                    title={`${eventName} check-in QR code`}
                  />
                )}
                <p className="mt-4 text-center font-semibold">{eventName || "Untitled event"}</p>
                <p className="mt-1 break-all text-center text-xs text-slate-500">{qrUrl}</p>
              </div>

              <button
                onClick={generateNewEventCode}
                className="mt-4 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
              >
                Generate New Event QR
              </button>

              <p className="mt-3 text-xs leading-5 text-amber-700">
                The QR opens this app&apos;s check-in section. Attendees need a URL
                reachable from their phones; localhost only works on the same device.
              </p>
            </div>

            <div id="event-check-in" className={cardClass}>
              <h2 className="text-lg font-bold">Attendee Check-in</h2>
              <p className="mt-1 text-sm text-slate-500">
                Register attendance for {eventName || "this event"}.
              </p>

              <form onSubmit={submitCheckIn} className="mt-5 space-y-4">
                <div>
                  <label className="mb-2 block text-sm font-medium">Full name</label>
                  <input
                    required
                    value={attendeeName}
                    onChange={(e) => setAttendeeName(e.target.value)}
                    placeholder="Enter your name"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Email or ID</label>
                  <input
                    required
                    type="email"
                    value={attendeeEmail}
                    onChange={(e) => setAttendeeEmail(e.target.value)}
                    placeholder="you@example.com"
                    className={inputClass}
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-medium">Department / Role</label>
                  <input
                    required
                    value={attendeeDepartment}
                    onChange={(e) => setAttendeeDepartment(e.target.value)}
                    placeholder="e.g. Computer Science / Student"
                    className={inputClass}
                  />
                </div>
                <button
                  type="submit"
                  className="w-full rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700"
                >
                  Submit Check-in
                </button>
              </form>

              {checkInMessage && (
                <p role="status" className="mt-4 rounded-xl bg-blue-50 p-3 text-sm text-blue-800">
                  {checkInMessage}
                </p>
              )}

              <div className="mt-6 border-t border-slate-100 pt-5">
                <button
                  onClick={() => {
                    setScannedValue("");
                    setScannerOpen(!scannerOpen);
                  }}
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm font-semibold hover:bg-slate-50"
                >
                  {scannerOpen ? "Close QR Scanner" : "Open Camera QR Scanner"}
                </button>

                {scannerOpen && (
                  <div className="mt-4">
                    <div id="attendance-qr-reader" className="overflow-hidden rounded-xl" />
                    <p className="mt-2 text-xs text-slate-500">
                      Allow camera access when prompted. Camera access usually requires HTTPS or localhost.
                    </p>
                  </div>
                )}

                {scannedValue && (
                  <div className="mt-3 break-all rounded-lg bg-slate-50 p-3 text-xs">
                    <strong>Scanned QR:</strong> {scannedValue}
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className={cardClass}>
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold">Live Event Check-in Log</h2>
                <p className="mt-1 text-sm text-slate-500">
                  New submissions appear immediately in this browser.
                </p>
              </div>
              <button
                onClick={exportCSV}
                disabled={attendees.length === 0}
                className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                Export CSV / Excel
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b text-slate-500">
                    <th className="px-3 py-4 font-medium">Attendee</th>
                    <th className="px-3 py-4 font-medium">Department / Role</th>
                    <th className="px-3 py-4 font-medium">Check-in time</th>
                  </tr>
                </thead>
                <tbody>
                  {attendees.map((attendee) => (
                    <tr key={attendee.id} className="border-b border-slate-100">
                      <td className="px-3 py-4">
                        <p className="font-semibold">{attendee.name}</p>
                        <p className="mt-1 text-xs text-slate-500">{attendee.email}</p>
                      </td>
                      <td className="px-3 py-4">{attendee.department}</td>
                      <td className="px-3 py-4 text-slate-500">{attendee.time}</td>
                    </tr>
                  ))}
                  {attendees.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-3 py-10 text-center text-slate-500">
                        No check-ins yet. Submit the form above to test the event log.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </>
      )}

      <footer className="mt-6 text-center text-xs text-slate-400">
        Attendance demo · Data is held in browser state and is not yet persisted.
      </footer>
    </main>
  );
}
