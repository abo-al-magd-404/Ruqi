// ============= Progress: Lessons =============
// Reads a student's lesson progress, marks a lesson step complete
// (video / explanation / book), and submits homework answers.

import { API_BASE_URL, authedJson } from "../core/http";
import type {
  HomeworkResult,
  LessonProgress,
  LessonProgressType,
} from "../types/progress";

export async function updateLessonProgress(
  lessonId: string,
  type: LessonProgressType,
): Promise<LessonProgress> {
  const res = await authedJson<{ data: LessonProgress }>(
    `${API_BASE_URL}/progress/lessons/${lessonId}`,
    "PATCH",
    { type },
  );
  return res.data;
}

export async function getLessonProgress(lessonId: string): Promise<LessonProgress> {
  const res = await authedJson<{ data: LessonProgress }>(
    `${API_BASE_URL}/progress/lessons/${lessonId}`,
    "GET",
  );
  return res.data;
}

export async function submitHomework(
  lessonId: string,
  answers: number[][],
): Promise<HomeworkResult> {
  const res = await authedJson<{ data: HomeworkResult }>(
    `${API_BASE_URL}/progress/lessons/${lessonId}/homework`,
    "POST",
    { answers },
  );
  return res.data;
}
