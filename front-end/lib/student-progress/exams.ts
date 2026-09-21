// ============= Student Progress: Exams =============
// Reads a student's exam progress and submits exam answers for grading.

import { API_BASE_URL, authedJson } from "../core/http";
import type { ExamProgress, ExamResult } from "../types/progress";

export async function getExamProgress(examId: string): Promise<ExamProgress> {
  const res = await authedJson<{ data: ExamProgress }>(
    `${API_BASE_URL}/progress/exams/${examId}`,
    "GET",
  );
  return res.data;
}

export async function submitExam(
  examId: string,
  answers: number[][],
): Promise<ExamResult> {
  const res = await authedJson<{ data: ExamResult }>(
    `${API_BASE_URL}/progress/exams/${examId}/submit`,
    "POST",
    { answers },
  );
  return res.data;
}
