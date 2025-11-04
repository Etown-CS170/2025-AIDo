import { useState, useEffect } from "react";
import Chat from "./pages/Chat";

const NAV_ITEMS = [
  { key: "generate", label: "GENERATE" },
  { key: "chat", label: "CHAT" },
  { key: "ai-do", label: "AI-DO" },
  { key: "calendar", label: "CALENDAR" },
  { key: "budget", label: "BUDGET" },
] as const;

type NavKey = typeof NAV_ITEMS[number]["key"];

interface User {
  id?: string;
  name: string;
  email: string;
}

export default function App() {
  const [active, setActive] = useState<NavKey>("ai-do");
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSignUpModal, setShowSignUpModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }
    setIsLoading(false);
  }, []);

  // Handle login
  const handleLogin = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowLoginModal(false);
  };

  // Handle signup
  const handleSignup = (userData: User) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    setShowSignUpModal(false);
  };

  // Handle logout
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-slate-600">Loading...</div>
      </div>
    );
  }

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
      <main className={active === "chat" && user ? "h-[calc(100vh-120px)]" : "flex-grow mx-auto max-w-5xl px-6 py-16 pb-24"}>
        {active === "ai-do" && <AiDoHome />}
        {/* TODO: Make placeholder page only appear if user is not logged in */}
        {active === "generate" && <PlaceholderPage title="Generate" user={user} onLoginClick={() => setShowLoginModal(true)} />}
        {active === "chat" && (user ? <Chat /> : <PlaceholderPage title="Chat" user={user} onLoginClick={() => setShowLoginModal(true)} />)}
        {active === "calendar" && <PlaceholderPage title="Calendar" user={user} onLoginClick={() => setShowLoginModal(true)} />}
        {active === "budget" && <PlaceholderPage title="Budget" user={user} onLoginClick={() => setShowLoginModal(true)} />}
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
          
          {/* Login/User Section */}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="text-sm text-slate-700">
                Welcome, <span className="font-medium">{user.name}</span>
              </span>
              <button
                onClick={handleLogout}
                className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
              >
                LOGOUT
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowLoginModal(true)}
              className="rounded-lg px-4 py-2 text-sm font-medium text-slate-700 transition-all hover:bg-white/50 hover:text-slate-900 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
            >
              LOGIN
            </button>
          )}
        </div>
      </footer>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal 
          onClose={() => setShowLoginModal(false)} 
          onSwitchToSignup={() => {
            setShowLoginModal(false);
            setShowSignUpModal(true);
          }}
          onLogin={handleLogin}
        />
      )}

      {/* Signup Modal */}
      {showSignUpModal && (
        <SignupModal 
          onClose={() => setShowSignUpModal(false)}
          onSwitchToLogin={() => {
            setShowSignUpModal(false);
            setShowLoginModal(true);
          }}
          onSignup={handleSignup}
        />
      )}
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
function PlaceholderPage({ title, user, onLoginClick }: { 
  title: string; 
  user: User | null;
  onLoginClick: () => void;
}) {
  // If user is not logged in, show login prompt
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="rounded-2xl border border-slate-200 bg-white p-10 text-center shadow-sm max-w-md">
          <div className="text-5xl mb-4">🔒</div>
          <h1 className="text-3xl font-bold text-slate-800">{title}</h1>
          <p className="mt-3 text-slate-600">
            Please sign in to access the {title.toLowerCase()} feature.
          </p>
          <button
            onClick={onLoginClick}
            className="mt-6 rounded-lg bg-rose-400 px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            Sign In to Continue
          </button>
        </div>
      </div>
    );
  }

  // If user is logged in, show the page content
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <h1 className="text-5xl font-bold text-slate-800">{title}</h1>
      <p className="mt-3 text-slate-500">
        Welcome, {user.name}! This is the {title.toLowerCase()} page. Content coming soon!
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

/* ---------- Login/Signup Modals ---------- */
function LoginModal({ onClose, onSwitchToSignup, onLogin }: { 
  onClose: () => void; 
  onSwitchToSignup: () => void;
  onLogin: (userData: User) => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        setError(data?.error || "Login failed");
        return;
      }

      const data = await response.json();
      if (data?.token) localStorage.setItem("aido_token", data.token);

      const user: User = {
        id: data.user.id,
        name: data.user.firstName + " " + data.user.lastName,
        email: data.user.email
      };

      onLogin(user);
            
    } catch (err) {
      setError("Login failed. Please try again.");
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <h2 className="text-2xl font-bold text-slate-800">Welcome Back</h2>
        <p className="mt-2 text-sm text-slate-600">Sign in to continue to AI-Do</p>

        {error && (
          <div className="mt-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-rose-400 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            Sign In
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            Don't have an account?{" "}
            <button
              onClick={onSwitchToSignup}
              className="font-semibold text-rose-400 transition-colors hover:text-rose-500 focus:outline-none focus-visible:underline"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

function SignupModal({ onClose, onSwitchToLogin, onSignup }: { 
  onClose: () => void; 
  onSwitchToLogin: () => void;
  onSignup: (userData: User) => void;
}) {
  const [fname, setFirst] = useState("");
  const [lname, setLast] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: fname,
          lastName: lname,
          email,
          password,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setError(data?.error || "Sign up failed");
        return;
      }

      // Save token
      if (data?.token) localStorage.setItem("aido_token", data.token);
      
      // Create user object and call onSignup
      const newUser: User = {
        id: data?.user?.id || data?.id,
        name: `${fname} ${lname}`,
        email: email
      };
      
      onSignup(newUser);
    } catch (err) {
      setError("Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-lg p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          aria-label="Close"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Modal content */}
        <h2 className="text-2xl font-bold text-slate-800">Create Account</h2>
        <p className="mt-2 text-sm text-slate-600">Join AI-Do to start planning your perfect wedding</p>

        {error && (
          <div className="mb-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 border border-rose-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <div>
            <label htmlFor="signup-fname" className="block text-sm font-medium text-slate-700">
              First Name
            </label>
            <input
              type="text"
              id="signup-fname"
              value={fname}
              onChange={(e) => setFirst(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Jane"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-lname" className="block text-sm font-medium text-slate-700">
              Last Name
            </label>
            <input
              type="text"
              id="signup-lname"
              value={lname}
              onChange={(e) => setLast(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="Doe"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              type="email"
              id="signup-email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="you@example.com"
              required
            />
          </div>

          <div>
            <label htmlFor="signup-password" className="block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              type="password"
              id="signup-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <div>
            <label htmlFor="signup-confirm-password" className="block text-sm font-medium text-slate-700">
              Confirm Password
            </label>
            <input
              type="password"
              id="signup-confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-slate-300 px-4 py-2 text-slate-900 focus:border-rose-300 focus:outline-none focus:ring-2 focus:ring-rose-300"
              placeholder="••••••••"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-rose-400 px-4 py-2.5 text-sm font-semibold text-white transition-all hover:bg-rose-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-600">
            Already have an account?{" "}
            <button
              onClick={onSwitchToLogin}
              className="font-semibold text-rose-400 transition-colors hover:text-rose-500 focus:outline-none focus-visible:underline"
            >
              Sign In
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}

