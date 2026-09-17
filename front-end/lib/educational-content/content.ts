import { API_BASE_URL, authedFetch, authedJson, formatApiError, safeJson } from "../core/http";
import type {
  ContentDetails,
  ContentPayload,
  ContentType,
  ExamPayload,
  LessonExam,
  LessonPayload,
  MonthContent,
  ReorderItem,
} from "../types/educational-content";

// ============= Student (Public) =============

export async function getContentByMonth(monthId: string): Promise<MonthContent> {
  const res = await authedFetch(`${API_BASE_URL}/educational-content/content/month/${monthId}`, {
    method: "GET",
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  const src = Array.isArray(data)
    ? { locked: false, items: data as LessonExam[] }
    : (data as MonthContent);
  return { locked: src.locked === true, items: src.items ?? [] };
}

export const getMonthContent = getContentByMonth;

export async function getContentById(id: string): Promise<ContentDetails> {
  const candidates = [
    `${API_BASE_URL}/educational-content/lessons/${id}`,
    `${API_BASE_URL}/educational-content/exams/${id}`,
    `${API_BASE_URL}/educational-content/content/${id}`,
  ];
  let lastError = "تعذر الاتصال بالخادم";
  for (const url of candidates) {
    let res: Response;
    try {
      res = await authedFetch(url, { method: "GET" });
    } catch {
      continue;
    }
    const data = await safeJson(res).catch(() => ({}));
    if (res.ok) {
      return data as ContentDetails;
    }
    lastError = res.status === 404 ? formatApiError(data) : formatApiError(data);
    if (res.status !== 404) {
      break;
    }
  }
  throw new Error(lastError);
}

// ============= Teacher CRUD =============

export async function createLesson(payload: LessonPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/lessons`, "POST", payload);
}

export async function createExam(payload: ExamPayload): Promise<LessonExam> {
  return authedJson(`${API_BASE_URL}/educational-content/exams`, "POST", payload);
}

export async function updateContent(
  id: string,
  type: ContentType,
  payload: ContentPayload,
): Promise<LessonExam> {
  const specific = `${API_BASE_URL}/educational-content/${type === "LESSON" ? "lessons" : "exams"}/${id}`;
  try {
    return await authedJson(specific, "PATCH", payload);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      return authedJson(`${API_BASE_URL}/educational-content/content/${id}`, "PATCH", payload);
    }
    throw err;
  }
}

export async function deleteContent(id: string, type: ContentType): Promise<{ message: string }> {
  const specific = `${API_BASE_URL}/educational-content/${type === "LESSON" ? "lessons" : "exams"}/${id}`;
  try {
    return await authedJson(specific, "DELETE");
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      return authedJson(`${API_BASE_URL}/educational-content/content/${id}`, "DELETE");
    }
    throw err;
  }
}

export async function reorderContent(items: ReorderItem[]): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/content/reorder`, "PATCH", { items });
}