import { useRef, useState, type ChangeEvent } from "react";
import { uploadPostImage } from "../lib/storage";

interface ImageUploadButtonProps {
  userId: string;
  onInserted: (markdownImageTag: string) => void;
  disabled?: boolean;
}

export function ImageUploadButton({ userId, onInserted, disabled }: ImageUploadButtonProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Vui lòng chọn một tệp hình ảnh hợp lệ.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage("Kích thước ảnh tối đa là 5MB.");
      return;
    }

    setUploading(true);
    setErrorMessage(null);

    try {
      const publicUrl = await uploadPostImage(file, userId);
      const altText = file.name.replace(/\.[^/.]+$/, "").replace(/[[\]]/g, "");
      const markdownTag = `\n![${altText || "Ảnh"}](${publicUrl})\n`;
      onInserted(markdownTag);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Tải ảnh thất bại";
      setErrorMessage(msg);
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  return (
    <div className="relative inline-flex items-center">
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        disabled={disabled || uploading}
      />
      <button
        type="button"
        disabled={disabled || uploading}
        onClick={() => fileInputRef.current?.click()}
        className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs font-medium text-zinc-700 hover:bg-zinc-100 disabled:opacity-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
        title="Tải ảnh lên và chèn vào nội dung"
      >
        {uploading ? (
          <>
            <svg className="h-3.5 w-3.5 animate-spin text-accent-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
            </svg>
            <span>Đang tải ảnh...</span>
          </>
        ) : (
          <>
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Chèn ảnh</span>
          </>
        )}
      </button>

      {errorMessage && (
        <div className="absolute top-full left-0 z-20 mt-1 max-w-xs rounded-lg bg-red-50 p-2 text-xs text-red-700 shadow-md border border-red-200 dark:bg-red-950/80 dark:border-red-900 dark:text-red-300">
          {errorMessage}
          <button
            type="button"
            onClick={() => setErrorMessage(null)}
            className="ml-2 font-bold text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}

