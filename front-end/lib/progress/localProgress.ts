// ============= Progress: Local (Offline) =============
// Student progress stored entirely in localStorage. Acts as an optimistic
// mirror of server progress: marking a step here completes a lesson/exam
// client-side even before (or without) the server confirmation.

const STORAGE_KEY = "ruqi_local_progress_v1";

type LocalSteps = {
  video?: boolean;
  explanation?: boolean;
  book?: boolean;
  examPassed?: boolean;
};

type LessonLike = {
  _id: unknown;
  videoUrl?: string | null;
  writtenExplanation?: string | null;
  note?: string | null;
};

function readMap(): Record<string, LocalSteps> {
  // SSR guard: localStorage only exists in the browser.
  if (typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, LocalSteps>;
    return typeof parsed === "object" && parsed ? parsed : {};
  } catch {
    return {};
  }
}

function writeMap(map: Record<string, LocalSteps>) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {}
}

export function markLocalStep(
  itemId: string,
  step: "video" | "explanation" | "book",
) {
  const map = readMap();
  map[String(itemId)] = { ...(map[String(itemId)] ?? {}), [step]: true };
  writeMap(map);
}

export function markLocalExamPassed(examId: string) {
  const map = readMap();
  map[String(examId)] = { ...(map[String(examId)] ?? {}), examPassed: true };
  writeMap(map);
}

export function getLocalSteps(itemId: string): LocalSteps {
  return readMap()[String(itemId)] ?? {};
}

export function isLessonLocallyCompleted(item: LessonLike | null | undefined): boolean {
  if (!item) return false;
  const steps = getLocalSteps(String(item._id));
  // A lesson is complete when every step it actually has (video, written
  // explanation, book note) is marked locally; steps the item lacks are
  // considered satisfied.
  const videoOk = !item.videoUrl || steps.video === true;
  const explanationOk = !item.writtenExplanation || steps.explanation === true;
  const bookOk = !item.note || steps.book === true;
  return videoOk && explanationOk && bookOk;
}

export function isExamLocallyPassed(contentId: string): boolean {
  return getLocalSteps(String(contentId)).examPassed === true;
}