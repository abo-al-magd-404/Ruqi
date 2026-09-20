import type { ContentItem } from "../types/educational-content";
import type { MonthProgress } from "../types/progress";

export function getSequenceLockedIds(
  contentList: ContentItem[],
  progress: MonthProgress | null,
): Set<string> {
  const lockedIds = new Set<string>();
  if (!progress) return lockedIds;
  const completedLessons = new Set(
    progress.lessons.filter((entry) => entry.completed).map((entry) => String(entry.lesson)),
  );
  let blocked = false;
  for (const item of contentList) {
    const isUnfinishedLesson =
      item.type === "LESSON" && !completedLessons.has(String(item._id));
    if (isUnfinishedLesson && !blocked) {
      blocked = true;
      continue;
    }
    if (blocked) lockedIds.add(String(item._id));
  }
  return lockedIds;
}

export function isSequenceLocked(lockedIds: Set<string>, contentId: string): boolean {
  return lockedIds.has(String(contentId));
}