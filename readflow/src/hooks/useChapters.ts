"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchChapters(bookId: string) {
  const res = await fetch(`/api/books/${bookId}/chapters`);
  if (!res.ok) throw new Error("Failed to fetch chapters");
  return res.json();
}

export function useChapters(bookId: string) {
  return useQuery({
    queryKey: ["chapters", bookId],
    queryFn: () => fetchChapters(bookId),
    staleTime: 5 * 60 * 1000,
    enabled: !!bookId,
  });
}
