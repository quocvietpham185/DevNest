import { useTheme } from "../hooks/useTheme";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <div className="flex items-center rounded-full border border-zinc-200 bg-zinc-100 p-0.5 dark:border-zinc-800 dark:bg-zinc-900">
      <button
        type="button"
        onClick={() => setTheme("light")}
        title="Giao diện Sáng"
        aria-label="Chuyển sang giao diện Sáng"
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "light"
            ? "bg-white text-amber-500 shadow-sm dark:bg-zinc-800"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setTheme("system")}
        title="Theo hệ thống"
        aria-label="Chuyển sang giao diện theo Hệ thống"
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "system"
            ? "bg-white text-accent-600 shadow-sm dark:bg-zinc-800 dark:text-accent-400"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        }`}
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
          />
        </svg>
      </button>

      <button
        type="button"
        onClick={() => setTheme("dark")}
        title="Giao diện Tối"
        aria-label="Chuyển sang giao diện Tối"
        className={`flex h-7 w-7 items-center justify-center rounded-full transition-colors ${
          theme === "dark"
            ? "bg-white text-indigo-400 shadow-sm dark:bg-zinc-800 dark:text-indigo-400"
            : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
        }`}
      >
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
          />
        </svg>
      </button>
    </div>
  );
}
