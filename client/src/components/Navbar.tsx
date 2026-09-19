import { useState, type FormEvent } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabaseClient";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${
    isActive ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
  }`;

const NEW_LINKS = [
  { to: "/blog/new", label: "Bài viết" },
  { to: "/projects/new", label: "Project" },
  { to: "/questions/new", label: "Câu hỏi" },
  { to: "/share-repo", label: "Repo" },
];

export function Navbar() {
  const { session, loading } = useSession();
  const [query, setQuery] = useState("");
  const [newMenuOpen, setNewMenuOpen] = useState(false);
  const navigate = useNavigate();

  function handleSearch(e: FormEvent) {
    e.preventDefault();
    if (query.trim()) navigate(`/search?q=${encodeURIComponent(query.trim())}`);
  }

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-4xl flex-wrap items-center gap-3 px-6 py-4">
        <Link to="/" className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
          DevNest
        </Link>

        <nav className="flex items-center gap-4">
          <NavLink to="/" end className={navLinkClass}>
            Feed
          </NavLink>
          <NavLink to="/questions" className={navLinkClass}>
            Q&amp;A
          </NavLink>
        </nav>

        <form onSubmit={handleSearch} className="ml-auto min-w-0 flex-1 max-w-xs">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Tìm kiếm..."
            className="w-full rounded-full border border-zinc-300 bg-zinc-50 px-4 py-1.5 text-sm outline-none focus:border-accent-500 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50"
          />
        </form>

        {!loading && session && (
          <div className="relative">
            <button
              onClick={() => setNewMenuOpen((v) => !v)}
              onBlur={() => setTimeout(() => setNewMenuOpen(false), 150)}
              className="rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              + Đăng
            </button>
            {newMenuOpen && (
              <div className="absolute right-0 z-10 mt-2 w-40 rounded-2xl border border-zinc-200 bg-white p-1.5 shadow-lg dark:border-zinc-800 dark:bg-zinc-950">
                {NEW_LINKS.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="block rounded-xl px-3 py-2 text-sm text-zinc-700 hover:bg-accent-50 hover:text-accent-700 dark:text-zinc-300 dark:hover:bg-accent-700/20"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}

        {!loading &&
          (session ? (
            <div className="flex items-center gap-3">
              <Link
                to={`/u/${session.user.user_metadata.user_name ?? session.user.email}`}
                className="text-sm text-zinc-600 hover:underline dark:text-zinc-400"
              >
                @{session.user.user_metadata.user_name ?? session.user.email}
              </Link>
              <button
                onClick={() => supabase.auth.signOut()}
                className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
              >
                Đăng xuất
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600"
            >
              Đăng nhập
            </Link>
          ))}
      </div>
    </header>
  );
}
