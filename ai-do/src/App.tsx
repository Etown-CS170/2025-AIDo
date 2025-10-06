import { useState } from "react";

// Simple tab-based demo so this file can preview without react-router.
// Swap the tabs for <NavLink> from react-router-dom in your app.

const NAV_ITEMS = [
  { key: "generate", label: "GENERATE" },
  { key: "chat", label: "CHAT" },
  { key: "ai-do", label: "AI-DO" },
  { key: "calendar", label: "CALENDAR" },
  { key: "budget", label: "BUDGET" },
] as const;

const FOOT_ITEMS = [
  { key: "settings", label: "SETTINGS" },
  { key: "logout", label: "LOGOUT" },
]

type NavKey = typeof NAV_ITEMS[number]["key"];

export default function App() {
  const [active, setActive] = useState<NavKey>("ai-do");

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
      <main className="flex-grow mx-auto max-w-5xl px-6 py-16 pb-24">
        {active === "ai-do" && <AiDoHome />}
        {active === "generate" && <PlaceholderPage title="Generate" />}
        {active === "chat" && <PlaceholderPage title="Chat" />}
        {active === "calendar" && <PlaceholderPage title="Calendar" />}
        {active === "budget" && <PlaceholderPage title="Budget" />}
      </main>


      {/* Footer */}
      <footer className="fixed bottom-0 z-50 w-full border-t border-rose-100/60 bg-rose-100/60 backdrop-blur supports-[backdrop-filter]:bg-rose-100/40">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Empty space for balance */}
          <div className="w-20"></div>
          
          {/* Centered Logo */}
          <div className="flex items-center justify-center">
            <img 
              src="/AI-Do-Logo.png" 
              alt="AI-Do Logo" 
              className="h-8 w-auto"
            />
          </div>
          
          {/* Logout Button */}
          <button
            onClick={() => console.log('Logout clicked')}
            className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            LOGOUT
          </button>
        </div>
      </footer>
    </div>
  );
}

/* ---------- Primary Components ---------- */
/* ---------- AI-DO (Home Page) ---------- */
function AiDoHome() {
  return (
    <section className="rounded-3xl border border-slate-200/70 p-8 shadow-sm">
      <h1 className="text-4xl font-bold tracking-tight">Welcome to AI-Do</h1>
      <p className="mt-3 text-lg text-slate-600">
        Your all-in-one wedding planning assistant. Stay on top of tasks, budget
        wisely, and create beautiful inspiration — all from one place.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <FeatureCard
          title="Generate"
          desc="Create décor & invite mockups with the Creative Assistant."
          icon="🖼️"
        />
        <FeatureCard
          title="Chat"
          desc="Ask planning questions 24/7 with the AI Chatbot."
          icon="💬"
        />
        <FeatureCard
          title="Calendar"
          desc="Deadlines and milestones auto-organized for you."
          icon="📅"
        />
        <FeatureCard
          title="Budget"
          desc="Track categories and visualize spend vs. plan."
          icon="💸"
        />
      </div>
    </section>
  );
}

/* ---------- Placeholder pages ---------- */
function PlaceholderPage({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-5xl font-bold text-slate-800">{title}</h1>
      <p className="mt-3 text-slate-500">
        This is the {title.toLowerCase()} page. Content coming soon!
      </p>
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
