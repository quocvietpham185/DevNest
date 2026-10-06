import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSession } from "../hooks/useSession";
import { deleteContent, type FeedItem } from "../lib/content";

export function ContentOwnerActions({ item, editPath, afterDelete }: { item: FeedItem; editPath: string; afterDelete: string }) {
  const { session } = useSession();
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);

  if (!session || session.user.id !== item.authorId) return null;

  async function handleDelete() {
    if (!window.confirm("Bạn có chắc muốn xóa nội dung này không?")) return;
    setDeleting(true);
    try {
      await deleteContent(item.id);
      navigate(afterDelete);
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <Link to={editPath} className="text-sm font-medium text-zinc-500 hover:text-zinc-800 hover:underline dark:text-zinc-400 dark:hover:text-zinc-200">
        Chỉnh sửa
      </Link>
      <button type="button" onClick={handleDelete} disabled={deleting} className="text-sm font-medium text-red-600 hover:underline disabled:opacity-50">
        {deleting ? "Đang xóa..." : "Xóa"}
      </button>
    </div>
  );
}