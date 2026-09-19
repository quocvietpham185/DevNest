export function EmptyState({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="flex flex-col items-center gap-1 rounded-2xl border border-dashed border-zinc-300 bg-white/50 px-6 py-14 text-center dark:border-zinc-700 dark:bg-zinc-950/50">
      <p className="font-medium text-zinc-700 dark:text-zinc-300">{title}</p>
      {hint && <p className="text-sm text-zinc-500 dark:text-zinc-400">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
      {message}
    </div>
  );
}
