"use client";

import { useState } from "react";
import Button from "@/components/ui/Button";
import { GripVertical, ICON_COMPACT } from "@/lib/icons";

interface Chapter {
  id: string;
  title: string | null;
  sort_order: number;
}

interface ChapterEditModeProps {
  bookId: string;
  chapters: Chapter[];
  onSave: () => void;
  onCancel: () => void;
}

export default function ChapterEditMode({
  bookId,
  chapters: initialChapters,
  onSave,
  onCancel,
}: ChapterEditModeProps) {
  const [chapters, setChapters] = useState(
    initialChapters.map((ch, i) => ({
      ...ch,
      title: ch.title ?? `Chapter ${i + 1}`,
    }))
  );
  const [saving, setSaving] = useState(false);

  function handleTitleChange(id: string, title: string) {
    setChapters((prev) =>
      prev.map((ch) => (ch.id === id ? { ...ch, title } : ch))
    );
  }

  function handleMoveUp(index: number) {
    if (index === 0) return;
    setChapters((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index]!, next[index - 1]!];
      return next;
    });
  }

  function handleMoveDown(index: number) {
    if (index === chapters.length - 1) return;
    setChapters((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1]!, next[index]!];
      return next;
    });
  }

  async function handleSave() {
    setSaving(true);
    try {
      const payload = chapters.map((ch, i) => ({
        id: ch.id,
        sort_order: i,
        title: ch.title,
      }));

      const res = await fetch(`/api/books/${bookId}/chapters/reorder`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Failed to save");
      onSave();
    } catch {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="edit-mode">
        <div className="edit-header">
          <h2 className="section-title">Edit Chapters</h2>
          <div className="edit-actions">
            <Button variant="ghost" size="sm" onClick={onCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} loading={saving}>
              Save
            </Button>
          </div>
        </div>

        <div className="edit-list">
          {chapters.map((ch, i) => (
            <div key={ch.id} className="edit-row">
              <div className="drag-handle">
                <button
                  onClick={() => handleMoveUp(i)}
                  disabled={i === 0}
                  className="move-btn"
                  aria-label="Move up"
                >
                  &#8593;
                </button>
                <button
                  onClick={() => handleMoveDown(i)}
                  disabled={i === chapters.length - 1}
                  className="move-btn"
                  aria-label="Move down"
                >
                  &#8595;
                </button>
              </div>
              <input
                type="text"
                value={ch.title}
                onChange={(e) => handleTitleChange(ch.id, e.target.value)}
                className="edit-input"
              />
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        .edit-mode {
          margin-top: 32px;
        }
        .edit-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }
        .section-title {
          font-family: var(--font-display);
          font-size: 20px;
          color: var(--text-primary);
        }
        .edit-actions {
          display: flex;
          gap: 8px;
        }
        .edit-list {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }
        .edit-row {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 8px;
          border-radius: 8px;
          background: var(--bg-secondary);
        }
        .drag-handle {
          display: flex;
          flex-direction: column;
          gap: 2px;
        }
        .move-btn {
          width: 24px;
          height: 18px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          background: var(--bg-tertiary);
          border-radius: 4px;
          cursor: pointer;
          font-size: 12px;
          color: var(--text-secondary);
        }
        .move-btn:disabled {
          opacity: 0.3;
          cursor: not-allowed;
        }
        .edit-input {
          flex: 1;
          height: 36px;
          padding: 0 10px;
          font-size: 14px;
          border: 1px solid var(--border-default);
          border-radius: 6px;
          background: var(--bg-primary);
          color: var(--text-primary);
          outline: none;
        }
        .edit-input:focus {
          border-color: var(--accent);
        }
      `}</style>
    </>
  );
}
