import { NextResponse } from "next/server";
import { processBook } from "@/lib/processing/process-book";

export async function POST(request: Request) {
  const { book_id } = await request.json();

  if (!book_id) {
    return NextResponse.json({ error: "book_id required" }, { status: 400 });
  }

  try {
    const result = await processBook(book_id);
    return NextResponse.json(result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Processing failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
