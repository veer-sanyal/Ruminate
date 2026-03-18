import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const tag = searchParams.get("tag");
  const sort = searchParams.get("sort") ?? "recent";

  let query = supabase
    .from("books")
    .select("*")
    .eq("user_id", user.id);

  // Filter by status
  if (status === "reading") {
    query = query.is("finished_at", null);
  } else if (status === "finished") {
    query = query.not("finished_at", "is", null);
  }

  // Filter by tag
  if (tag) {
    query = query.contains("theme_tags", [tag]);
  }

  // Sort
  switch (sort) {
    case "title":
      query = query.order("title", { ascending: true });
      break;
    case "progress":
      query = query.order("created_at", { ascending: false });
      break;
    case "recent":
    default:
      query = query.order("created_at", { ascending: false });
      break;
  }

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data);
}
