// ============= Student Dashboard =============
// Month-level progress consumed by the student dashboard, fetched through
// the shared cache so the dashboard doesn't refetch on every render.

import { API_BASE_URL, authedJson } from "../core/http";
import { cachedGet } from "../educational-content/content";

export interface StudentLessonProgress {
  lesson: string;
  title: string;
  order: number;
  videoCompleted: boolean;
  explanationCompleted: boolean;
  homeworkCompleted: boolean;
  bookCompleted: boolean;
  totalPoints: number;
  completed: boolean;
}

export interface StudentExamProgress {
  exam: string;
  title: string;
  order: number;
  points: number;
  totalPoints: number;
  passed: boolean;
}

export interface StudentMonthProgress {
  month: string;
  lessons: StudentLessonProgress[];
  exams: StudentExamProgress[];
  summary: {
    totalPoints: number;
    lessonPoints: number;
    examPoints: number;
    totalLessons: number;
    completedLessons: number;
    totalExams: number;
    completedExams: number;
  };
}

export async function getMonthProgress(monthId: string): Promise<StudentMonthProgress> {
  return cachedGet(`progress-month:${monthId}`, () =>
    authedJson<{ data: StudentMonthProgress }>(
      `${API_BASE_URL}/progress/months/${monthId}`,
      "GET",
    ).then((res) => res.data),
  );
}