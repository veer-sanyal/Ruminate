"use client";

import { useQuery } from "@tanstack/react-query";
import type { Book } from "@/types";

async function fetchBook(bookId: string): Promise<Book> {
  const res = await fetch(`/api/books/${bookId}`);
  if (!res.ok) throw new Error("Failed to fetch book");
  return res.json();
}

export function useProcessingStatus(bookId: string) {
  return useQuery({
    queryKey: ["book", bookId, "processing"],
    queryFn: () => fetchBook(bookId),
    refetchInterval: (query) => {
      const status = query.state.data?.processing_status;
      if (status === "ready" || status === "error") return false;
      return 3000; // Poll every 3 seconds
    },
    enabled: !!bookId,
  });
}
