"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchChapter(bookId: string, chapterId: string) {
  const res = await fetch(`/api/books/${bookId}/chapters/${chapterId}`);
  if (!res.ok) throw new Error("Failed to fetch chapter");
  return res.json();
}

export function useChapter(bookId: string, chapterId: string) {
  return useQuery({
    queryKey: ["chapter", bookId, chapterId],
    queryFn: () => fetchChapter(bookId, chapterId),
    staleTime: Infinity, // Chapter text is immutable
    enabled: !!bookId && !!chapterId,
  });
}
