import { NavLink } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { supabase } from "../lib/supabaseClient";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  `text-sm font-medium ${isActive ? "text-zinc-950 dark:text-zinc-50" : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"}`;

export function Navbar() {
  const { session, loading } = useSession();

  return (
    <header className="border-b border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <NavLink to="/" className="text-lg font-semibold tracking-tight text-zinc-950 dark:text-zinc-50">
            DevNest
          </NavLink>
          <nav className="flex items-center gap-4">
            <NavLink to="/" end className={navLinkClass}>
              Feed
            </NavLink>
            <NavLink to="/share-repo" className={navLinkClass}>
              Share repo
            </NavLink>
          </nav>
        </div>

        {loading ? null : session ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-zinc-600 dark:text-zinc-400">
              @{session.user.user_metadata.user_name ?? session.user.email}
            </span>
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-sm font-medium text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200"
            >
              Đăng xuất
            </button>
          </div>
        ) : (
          <button
            onClick={() => supabase.auth.signInWithOAuth({ provider: "github" })}
            className="rounded-full bg-zinc-950 px-4 py-1.5 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-zinc-200"
          >
            Đăng nhập với GitHub
          </button>
        )}
      </div>
    </header>
  );
}
