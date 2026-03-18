"use client";

import { useQuery } from "@tanstack/react-query";

async function fetchBook(bookId: string) {
  const res = await fetch(`/api/books/${bookId}`);
  if (!res.ok) throw new Error("Failed to fetch book");
  return res.json();
}

export function useBook(bookId: string) {
  return useQuery({
    queryKey: ["book", bookId],
    queryFn: () => fetchBook(bookId),
    staleTime: 5 * 60 * 1000,
    enabled: !!bookId,
  });
}
