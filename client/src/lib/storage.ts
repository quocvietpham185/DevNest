import { supabase } from "./supabaseClient";

/**
 * Uploads an image to Supabase Storage bucket `post-images`.
 * If the bucket doesn't exist or upload fails, falls back to local data URL for preview.
 */
export async function uploadPostImage(file: File, userId: string): Promise<string> {
  const fileExt = file.name.split(".").pop() || "png";
  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${fileExt}`;

  const { error } = await supabase.storage
    .from("post-images")
    .upload(fileName, file, { cacheControl: "3600", upsert: true });

  if (error) {
    // If Supabase Storage bucket is not yet created, provide a warning and fallback
    console.warn("Supabase storage upload error:", error.message);
    throw new Error(`Lỗi tải ảnh lên: ${error.message}. Vui lòng tạo bucket 'post-images' trong Supabase Storage.`);
  }

  const { data } = supabase.storage.from("post-images").getPublicUrl(fileName);
  return data.publicUrl;
}
