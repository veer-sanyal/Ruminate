"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

interface DeleteBookModalProps {
  open: boolean;
  onClose: () => void;
  bookId: string;
  bookTitle: string;
}

export default function DeleteBookModal({
  open,
  onClose,
  bookId,
  bookTitle,
}: DeleteBookModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      const res = await fetch(`/api/books/${bookId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      queryClient.invalidateQueries({ queryKey: ["books"] });
      router.push("/library");
    } catch {
      setDeleting(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} title="Delete Book">
      <>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", lineHeight: 1.5 }}>
          Delete <strong>{bookTitle}</strong>? This removes all chapters, audio,
          and reflections. This action cannot be undone.
        </p>
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "20px" }}>
          <Button variant="ghost" onClick={onClose} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete} loading={deleting}>
            Delete
          </Button>
        </div>
      </>
    </Modal>
  );
}
