import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  const ext = file.name.split(".").pop()?.toLowerCase();
  if (ext !== "epub" && ext !== "pdf") {
    return NextResponse.json(
      { error: "Only EPUB and PDF files are supported" },
      { status: 400 }
    );
  }

  // Validate file size (100MB)
  if (file.size > 100 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File must be under 100MB" },
      { status: 400 }
    );
  }

  const bookId = crypto.randomUUID();
  const filePath = `${user.id}/${bookId}.${ext}`;

  // Upload to Supabase Storage
  const fileBuffer = await file.arrayBuffer();
  const { error: storageError } = await supabase.storage
    .from("book-files")
    .upload(filePath, fileBuffer, {
      contentType: file.type,
      upsert: false,
    });

  if (storageError) {
    return NextResponse.json(
      { error: `Storage error: ${storageError.message}` },
      { status: 500 }
    );
  }

  // Extract title from filename (cleaned up)
  const title = file.name
    .replace(/\.[^.]+$/, "")
    .replace(/[-_]/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  // Create book record
  const { error: dbError } = await supabase.from("books").insert({
    id: bookId,
    user_id: user.id,
    title,
    source_file_url: filePath,
    source_format: ext as "epub" | "pdf",
    processing_status: "uploading",
  });

  if (dbError) {
    return NextResponse.json(
      { error: `Database error: ${dbError.message}` },
      { status: 500 }
    );
  }

  // Trigger processing pipeline (fire and forget)
  const origin = new URL(request.url).origin;
  fetch(`${origin}/api/internal/process-book`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ book_id: bookId }),
  }).catch(() => {
    // Processing will be retried on next poll
  });

  return NextResponse.json({ book_id: bookId });
}
