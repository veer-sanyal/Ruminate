"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

async function fetchReflection(chapterId: string) {
  const res = await fetch(`/api/reflections?chapter_id=${chapterId}`);
  if (!res.ok) throw new Error("Failed to fetch reflection");
  const data = await res.json();
  return data[0] ?? null;
}

async function createReflection(chapterId: string) {
  const res = await fetch("/api/reflections", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chapter_id: chapterId }),
  });
  if (!res.ok) throw new Error("Failed to create reflection");
  return res.json();
}

async function updateReflection(id: string, updates: Record<string, unknown>) {
  const res = await fetch(`/api/reflections/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update reflection");
  return res.json();
}

async function generateRecall(id: string) {
  const res = await fetch(`/api/reflections/${id}/recall`, {
    method: "POST",
  });
  if (!res.ok) throw new Error("Failed to generate recall questions");
  return res.json();
}

export function useReflection(chapterId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["reflection", chapterId];

  const query = useQuery({
    queryKey,
    queryFn: () => fetchReflection(chapterId),
    staleTime: 2 * 60 * 1000,
    enabled: !!chapterId,
  });

  const createMutation = useMutation({
    mutationFn: () => createReflection(chapterId),
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (updates: Record<string, unknown>) => {
      if (!query.data?.id) throw new Error("No reflection to update");
      return updateReflection(query.data.id, updates);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, data);
    },
  });

  const recallMutation = useMutation({
    mutationFn: () => {
      if (!query.data?.id) throw new Error("No reflection");
      return generateRecall(query.data.id);
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKey, (prev: Record<string, unknown> | undefined) =>
        prev ? { ...prev, recall_questions: data.recall_questions } : prev
      );
    },
  });

  return {
    reflection: query.data,
    isLoading: query.isLoading,
    create: createMutation.mutate,
    isCreating: createMutation.isPending,
    update: updateMutation.mutate,
    isSaving: updateMutation.isPending,
    generateRecall: recallMutation.mutate,
    isGeneratingRecall: recallMutation.isPending,
  };
}

/**
 * Fetch reflections for all chapters in a book.
 */
export function useBookReflections(bookId: string) {
  return useQuery({
    queryKey: ["reflections", "book", bookId],
    queryFn: async () => {
      const res = await fetch(`/api/reflections?book_id=${bookId}`);
      if (!res.ok) throw new Error("Failed to fetch reflections");
      return res.json();
    },
    staleTime: 2 * 60 * 1000,
    enabled: !!bookId,
  });
}
