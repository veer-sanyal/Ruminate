import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

// Increase body size limit for file uploads (default is 4.5MB on Vercel)
export const maxDuration = 60;

export async function POST(request: Request) {
  try {
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
      return NextResponse.json(
        { error: "No file provided" },
        { status: 400 }
      );
    }

    // Validate file type
    const ext = file.name.split(".").pop()?.toLowerCase();
    if (ext !== "epub" && ext !== "pdf") {
      return NextResponse.json(
        { error: "Only EPUB and PDF files are supported" },
        { status: 400 }
      );
    }

    // Validate file size (50MB - stay within Vercel serverless limits)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json(
        { error: "File must be under 50MB" },
        { status: 400 }
      );
    }

    const bookId = crypto.randomUUID();
    const filePath = `${user.id}/${bookId}.${ext}`;

    // Upload to Supabase Storage
    const fileBuffer = await file.arrayBuffer();
    const { error: storageError } = await supabase.storage
      .from("book-files")
      .upload(filePath, Buffer.from(fileBuffer), {
        contentType: file.type,
        upsert: false,
      });

    if (storageError) {
      console.error("Storage upload error:", storageError);
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
      console.error("Database insert error:", dbError);
      return NextResponse.json(
        { error: `Database error: ${dbError.message}` },
        { status: 500 }
      );
    }

    // Trigger processing pipeline
    const origin = new URL(request.url).origin;
    try {
      const processRes = await fetch(`${origin}/api/internal/process-book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ book_id: bookId }),
      });
      if (!processRes.ok) {
        console.error(
          "Process-book failed:",
          processRes.status,
          await processRes.text()
        );
      }
    } catch (processErr) {
      console.error("Process-book fetch error:", processErr);
    }

    return NextResponse.json({ book_id: bookId });
  } catch (err) {
    console.error("Upload route error:", err);
    return NextResponse.json(
      {
        error:
          err instanceof Error ? err.message : "An unexpected error occurred",
      },
      { status: 500 }
    );
  }
}
