import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { z } from "zod";

const reorderSchema = z.array(
  z.object({
    id: z.string().uuid(),
    sort_order: z.number().int(),
    title: z.string().optional(),
  })
);

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Verify book ownership
  const { data: book } = await supabase
    .from("books")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!book) {
    return NextResponse.json({ error: "Book not found" }, { status: 404 });
  }

  const body = await request.json();
  const parsed = reorderSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid data", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Batch update
  const updates = parsed.data.map((item) => {
    const updateData: Record<string, unknown> = { sort_order: item.sort_order };
    if (item.title !== undefined) updateData.title = item.title;

    return supabase
      .from("chapters")
      .update(updateData)
      .eq("id", item.id)
      .eq("book_id", id);
  });

  await Promise.all(updates);

  return NextResponse.json({ success: true });
}
