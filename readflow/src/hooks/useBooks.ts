"use client";

import { useQuery } from "@tanstack/react-query";
import type { Book } from "@/types";

interface UseBooksOptions {
  status?: "reading" | "finished" | "all";
  tag?: string;
  sort?: "recent" | "title" | "progress";
}

async function fetchBooks(opts: UseBooksOptions): Promise<Book[]> {
  const params = new URLSearchParams();
  if (opts.status && opts.status !== "all") params.set("status", opts.status);
  if (opts.tag) params.set("tag", opts.tag);
  if (opts.sort) params.set("sort", opts.sort);

  const res = await fetch(`/api/books?${params}`);
  if (!res.ok) throw new Error("Failed to fetch books");
  return res.json();
}

export function useBooks(opts: UseBooksOptions = {}) {
  return useQuery({
    queryKey: ["books", opts],
    queryFn: () => fetchBooks(opts),
    staleTime: 5 * 60 * 1000,
    refetchInterval: (query) => {
      const hasProcessing = query.state.data?.some(
        (b) => b.processing_status !== "ready" && b.processing_status !== "error"
      );
      return hasProcessing ? 5_000 : false;
    },
  });
}
