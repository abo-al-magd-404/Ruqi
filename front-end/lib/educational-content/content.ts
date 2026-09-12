import { API_BASE_URL, authedJson, formatApiError, safeJson } from "../core/http";
import type {
  ContentDetails,
  ContentPayload,
  ExamPayload,
  LessonExam,
  LessonPayload,
  ReorderItem,
} from "../types/educational-content";

// ============= Student (Public) =============

export async function getContentByMonth(monthId: string): Promise<LessonExam[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/content/month/${monthId}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as LessonExam[];
}

export const getMonthContent = getContentByMonth;

export async function getContentById(id: string): Promise<ContentDetails> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/content/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    throw new Error("تعذر الاتصال بالخادم");
  }

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as ContentDetails;
}

// ============= Teacher CRUD =============

export async function createLesson(payload: LessonPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/lessons`, "POST", payload);
}

export async function createExam(payload: ExamPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/exams`, "POST", payload);
}

export async function updateContent(id: string, payload: ContentPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/content/${id}`, "PATCH", payload);
}

export async function deleteContent(id: string): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/content/${id}`, "DELETE");
}

export async function reorderContent(items: ReorderItem[]): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/content/reorder`, "PATCH", { items });
}