import { useState } from "react";

// Simple tab-based demo so this file can preview without react-router.
// Swap the tabs for <NavLink> from react-router-dom in your app.

const NAV_ITEMS = [
  { key: "generate", label: "GENERATE" },
  { key: "chat", label: "CHAT" },
  { key: "home", label: "HOME" },
  { key: "calendar", label: "CALENDAR" },
  { key: "budget", label: "BUDGET" },
] as const;

const FOOT_ITEMS = [
  { key: "settings", label: "SETTINGS" },
  { key: "logout", label: "LOGOUT" },
]

type NavKey = typeof NAV_ITEMS[number]["key"];

export default function App() {
  const [active, setActive] = useState<NavKey>("home");

  return (
    <div className="min-h-screen bg-white text-slate-800">
      {/* Top navbar */}
      <header className="sticky top-0 z-50 w-full border-b border-rose-100/60 bg-rose-100/60 backdrop-blur supports-[backdrop-filter]:bg-rose-100/40">
        <nav className="mx-auto flex max-w-6xl items-center justify-center px-4">
          <ul className="flex w-full max-w-3xl items-center justify-between gap-6 py-4">
            {NAV_ITEMS.map((item) => (
              <li key={item.key} className="">
                <button
                  onClick={() => setActive(item.key)}
                  className={[
                    "rounded-xl px-3 py-2 text-sm font-semibold tracking-wide transition-all",
                    "hover:scale-[1.03] focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300",
                    active === item.key
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-700/90 hover:text-slate-900",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      {/* Informational Home Section */}
      <main className="mx-auto max-w-5xl px-6 py-16">
        <section className="rounded-3xl border border-slate-200/70 p-8 shadow-sm">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to AI‑Do</h1>
          <p className="mt-3 text-lg text-slate-600">
            Your all‑in‑one wedding planning assistant. Stay on top of tasks, budget
            wisely, and create beautiful inspiration — all from one place.
          </p>

          {/* Quick feature cards */}
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <FeatureCard title="Generate" desc="Create décor & invite mockups with the Creative Assistant." icon="🖼️" active={active === "generate"} />
            <FeatureCard title="Chat" desc="Ask planning questions 24/7 with the AI Chatbot." icon="💬" active={active === "chat"} />
            <FeatureCard title="Calendar" desc="Deadlines and milestones auto‑organized for you." icon="📅" active={active === "calendar"} />
            <FeatureCard title="Budget" desc="Track categories and visualize spend vs. plan." icon="💸" active={active === "budget"} />
          </div>

          {/* Active tab mock content */}
          <div className="mt-10 rounded-2xl border border-slate-200/70 bg-white p-6">
            {active === "home" && (
              <div>
                <h2 className="text-2xl font-semibold">Home Overview</h2>
                <p className="mt-2 text-slate-600">Get a snapshot of your budget, timeline, and next steps.</p>
              </div>
            )}
            {active === "generate" && (
              <div>
                <h2 className="text-2xl font-semibold">Creative Assistant</h2>
                <p className="mt-2 text-slate-600">Describe your vibe; we’ll generate mood boards & mockups.</p>
              </div>
            )}
            {active === "chat" && (
              <div>
                <h2 className="text-2xl font-semibold">AI Chatbot</h2>
                <p className="mt-2 text-slate-600">Ask planning questions and get guided checklists instantly.</p>
              </div>
            )}
            {active === "calendar" && (
              <div>
                <h2 className="text-2xl font-semibold">Calendar</h2>
                <p className="mt-2 text-slate-600">Milestones, vendor due dates, and reminders in one view.</p>
              </div>
            )}
            {active === "budget" && (
              <div>
                <h2 className="text-2xl font-semibold">Smart Budget</h2>
                <p className="mt-2 text-slate-600">Allocate, track, and visualize spend across categories.</p>
              </div>
            )}
          </div>
        </section>
      </main>


      {/* Footer */}
      <header className="fixed bottom-0 z-50 w-full border-b border-rose-100/60 bg-rose-100/60 backdrop-blur supports-[backdrop-filter]:bg-rose-100/40">
       <nav className="mx-auto flex max-w-6xl items-center justify-center px-4">
        <ul className="flex w-full max-w-3xl items-center justify-between gap-6 py-4">
          {FOOT_ITEMS.map((item) => (
            <li key={item.key} className="">
              <button>
                {item.label}
              </button>
            </li>
          ))}
        </ul>
       </nav>
      </header>
      {/* <footer className="mx-auto max-w-5xl px-6 pb-16 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} AI‑Do
      </footer> */}
    </div>
  );
}

function FeatureCard({ title, desc, icon, active }: { title: string; desc: string; icon: string; active?: boolean }) {
  return (
    <div
      className={[
        "rounded-2xl border p-5 shadow-sm transition-all",
        active ? "border-rose-300 bg-rose-50" : "border-slate-200 bg-white hover:shadow"
      ].join(" ")}
    >
      <div className="text-3xl" aria-hidden>{icon}</div>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      <p className="mt-1 text-sm text-slate-600">{desc}</p>
    </div>
  );
}
