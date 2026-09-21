// ============= Progress: Sequence Locking =============
// Decides which items of a month (lessons AND exams) stay locked until the
// preceding items are completed. Completeness merges server progress with
// the optimistic localStorage mirror (see ./localProgress).

import type { ContentItem } from "../types/educational-content";
import type { MonthProgress, MonthProgressLesson } from "../types/progress";
import {
  isExamLocallyPassed,
  isLessonLocallyCompleted,
} from "./localProgress";

export type SequenceItem = ContentItem & {
  videoUrl?: string | null;
  writtenExplanation?: string | null;
  homework?: unknown[];
  note?: string | null;
};

export function isLessonPracticallyCompleted(
  item: SequenceItem | null | undefined,
  entry: MonthProgressLesson | undefined,
): boolean {
  if (!item) return false;
  const videoOk = !item.videoUrl || (entry?.videoCompleted ?? false);
  const explanationOk =
    !item.writtenExplanation || (entry?.explanationCompleted ?? false);
  const homeworkOk = true;
  const bookOk = !item.note || (entry?.bookCompleted ?? false);

  return videoOk && explanationOk && homeworkOk && bookOk;
}

export function getPracticalCompletedIds(
  contentList: SequenceItem[],
  progress: MonthProgress | null,
): Set<string> {
  // An item counts as completed if the server says so OR if local progress
  // (localStorage) also says so — belt and braces for the optimistic UI.
  const completedIds = new Set<string>();

  const examMap = new Map<string, boolean>();
  for (const exam of progress?.exams ?? []) {
    examMap.set(String(exam.exam), exam.passed);
  }

  const lessonMap = new Map<string, MonthProgressLesson>();
  for (const lesson of progress?.lessons ?? []) {
    lessonMap.set(String(lesson.lesson), lesson);
  }

  for (const item of contentList) {
    const itemId = String(item._id);
    if (item.type === "LESSON") {
      if (
        isLessonPracticallyCompleted(item, lessonMap.get(itemId)) ||
        isLessonLocallyCompleted(item)
      ) {
        completedIds.add(itemId);
      }
    } else if (examMap.get(itemId) || isExamLocallyPassed(itemId)) {
      completedIds.add(itemId);
    }
  }

  return completedIds;
}

export function getSequenceLockedIds(
  contentList: SequenceItem[],
  progress: MonthProgress | null,
): Set<string> {
  const lockedIds = new Set<string>();

  // Sequence lock: walk the items in order. The first unfinished item flips
  // the "blocked" flag, and from that point on every remaining item —
  // whether a lesson or an exam — stays locked until the blocker is done.
  const completedIds = getPracticalCompletedIds(contentList, progress);
  let blocked = false;
  for (const item of contentList) {
    if (!completedIds.has(String(item._id)) && !blocked) {
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