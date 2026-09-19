import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="flex flex-col items-center gap-3 py-20 text-center">
      <p className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">404</p>
      <p className="text-sm text-zinc-500 dark:text-zinc-400">Không tìm thấy trang này.</p>
      <Link to="/" className="rounded-full bg-accent-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-accent-600">
        Về trang chủ
      </Link>
    </div>
  );
}
