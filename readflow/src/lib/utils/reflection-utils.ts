/**
 * Auto-save a minimal reflection when the user skips the reflection sprint.
 * Creates a placeholder reflection so it's visible in history.
 */
export async function autoSaveMinimalReflection(chapterId: string): Promise<void> {
  try {
    const res = await fetch("/api/reflections", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chapter_id: chapterId }),
    });

    if (!res.ok) {
      console.warn("[AutoSave] Failed to create minimal reflection:", res.status);
    }
  } catch (err) {
    console.warn("[AutoSave] Error creating minimal reflection:", err);
  }
}
