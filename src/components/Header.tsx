import { Link, useLocation } from "react-router-dom";
import { ExternalLink, ChevronDown, Loader2, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";

const ADMIN_ROUTES = [
  { label: "Issue Certificate", to: "/admin/certificates/new" },
  { label: "Upload Cert Template", to: "/admin/templates/new" },
  { label: "Issue Badge", to: "/admin/badges/new" },
  { label: "Upload Badge Template", to: "/admin/badges/templates/new" },
];

const ACCOUNTS_LOGIN_API = import.meta.env.VITE_PUBLIC_ACCOUNTS_API || "https://accounts.sliitmozilla.org/api/login";
const TOKEN_KEY = "certify_token";

function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

export default function Header() {
  const location = useLocation();
  const [isLoggedIn, setIsLoggedIn] = useState(() => !!getToken());
  const [menuOpen, setMenuOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!getToken());
  }, [location.pathname]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node))
        setMenuOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLoginSuccess = (token: string) => {
    localStorage.setItem(TOKEN_KEY, token);
    setIsLoggedIn(true);
    setShowLoginModal(false);
  };

  const handleLogout = () => {
    setMenuOpen(false);
    clearToken();
    setIsLoggedIn(false);
  };

  return (
    <>
      <header
        id="site-header"
        className="bg-white z-50 sticky top-0 border-b border-[#e8e8e8]"
      >
        <div
          className="max-w-[1760px] mx-auto flex items-center justify-between px-[28px] h-[72px]"
        >
          <Link
            to="/"
            className="flex items-center gap-2 sm:gap-3 shrink-0"
            aria-label="SLIIT Mozilla Club home"
          >
            <img
              src="https://www.sliitmozilla.org/assets/Mozilla-logo.png"
              alt="Mozilla logo"
              className="h-[36px] w-auto object-contain"
            />
          </Link>

          <div className="flex items-center gap-[12px]">
            <a
              href="https://sliitmozilla.org"
              target="_blank"
              rel="noopener noreferrer"
              id="header-club-link"
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs sm:text-sm font-semibold text-moz-gray-mid border border-moz-gray-light rounded-full transition hover:text-moz-orange hover:border-moz-orange shrink-0"
            >
              <span>sliitmozilla.org</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>

            {isLoggedIn && (
              <div className="relative" ref={menuRef}>
                <button
                  id="admin-menu-btn"
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-[6px] px-3 h-[36px] bg-[#fff4ee] border border-[var(--color-moz-orange)] rounded-lg font-['Segoe_UI',sans-serif] font-medium text-[0.9rem] leading-none text-[var(--color-moz-orange)] cursor-pointer transition-opacity duration-150 hover:opacity-[0.88]"
                >
                  <span>Admin</span>
                  <ChevronDown
                    className={`w-[14px] h-[14px] transition-transform duration-200 ${menuOpen ? "rotate-180" : "rotate-0"}`}
                  />
                </button>

                {menuOpen && (
                  <div
                    id="admin-dropdown"
                    className="absolute right-0 top-[calc(100%+8px)] w-[220px] bg-white border border-[#e8e8e8] rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.10)] overflow-hidden z-50"
                  >
                    {ADMIN_ROUTES.map((route) => (
                      <Link
                        key={route.to}
                        to={route.to}
                        onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2.5 font-['Prompt','Inter',system-ui,sans-serif] font-semibold text-[0.82rem] text-[#414141] no-underline transition-[background,color] duration-150 hover:bg-[#fdf3ef] hover:text-[var(--color-moz-orange)]"
                      >
                        {route.label}
                      </Link>
                    ))}
                    <div className="border-t border-[#e8e8e8]" />
                    <button
                      onClick={handleLogout}
                      className="block px-4 py-2.5 font-['Prompt','Inter',system-ui,sans-serif] font-semibold text-[0.82rem] text-[#ef4444] bg-transparent border-none w-full text-left cursor-pointer transition-colors duration-150 hover:bg-[#fef2f2]"
                    >
                      Log Out
                    </button>
                  </div>
                )}
              </div>
            )}

            {!isLoggedIn && (
              <button
                id="login-btn"
                onClick={() => setShowLoginModal(true)}
                className="px-4 py-[6px] bg-[var(--color-moz-orange)] border-none rounded-[5px] font-['Prompt','Inter',system-ui,sans-serif] font-bold text-[0.875rem] text-white cursor-pointer tracking-[0.01em] shadow-[0_4px_14px_rgba(244,118,36,0.3)] transition-[background,transform] duration-[0.18s] whitespace-nowrap hover:bg-[#d96810] hover:-translate-y-[1px]"
              >
                Login
              </button>
            )}
          </div>
        </div>
      </header>

      {showLoginModal && (
        <LoginModal
          onSuccess={handleLoginSuccess}
          onClose={() => setShowLoginModal(false)}
        />
      )}
    </>
  );
}

/* ─── Inline Login Modal ─────────────────────────────────────────────────── */

function LoginModal({
  onSuccess,
  onClose,
}: {
  onSuccess: (token: string) => void;
  onClose: () => void;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(ACCOUNTS_LOGIN_API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), password }),
      });

      const data = await res.json();

      if (!res.ok || !data?.data?.token) {
        const msg =
          data?.error?.message ?? data?.message ?? "Invalid email or password.";
        setError(Array.isArray(msg) ? msg[0]?.reason ?? msg[0] : msg);
        return;
      }

      onSuccess(data.data.token);
    } catch {
      setError("Could not reach the auth server. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBackdrop = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      className="fixed inset-0 z-[999] flex items-center justify-center px-4 bg-[rgba(0,0,0,0.45)] backdrop-blur-[2px]"
      onClick={handleBackdrop}
    >
      <div
        className="bg-white rounded-2xl w-full max-w-sm p-8 relative animate-[fadeInUp_0.18s_ease] shadow-[0_24px_60px_rgba(0,0,0,0.18)]"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-moz-gray-mid hover:text-moz-black transition-colors cursor-pointer bg-transparent border-none"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex flex-col items-center mb-6">
          <img
            src="https://www.sliitmozilla.org/assets/Mozilla-logo.png"
            alt="Mozilla logo"
            className="h-8 w-auto mb-3"
          />
          <h2 className="text-xl font-extrabold text-moz-black tracking-tight m-0">
            Admin Sign In
          </h2>
          <p className="text-xs text-moz-gray-mid mt-1">
            SLIIT Mozilla Club - Certify Portal
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="login-email" className="text-xs font-semibold text-moz-gray-dark">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@sliit.edu.lk"
              className="form-input"
              disabled={loading}
            />
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="login-password" className="text-xs font-semibold text-moz-gray-dark">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="form-input"
              disabled={loading}
            />
          </div>

          {error && (
            <p className="text-xs text-[#c0392b] bg-[#fdf0ef] border border-[#f5c6c2] rounded-lg px-3 py-2 m-0">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading || !email || !password}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-white text-[0.9rem] transition-all cursor-pointer bg-gradient-to-br from-[var(--color-moz-orange)] to-[var(--color-moz-orange-mid)] border-none ${loading ? "opacity-60 cursor-not-allowed" : "shadow-[0_4px_14px_rgba(255,113,57,0.35)] disabled:opacity-60 disabled:cursor-not-allowed"
              }`}
          >
            {loading && <Loader2 className="w-4 h-4 animate-spin" />}
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
