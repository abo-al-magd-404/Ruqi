import { API_BASE_URL, authedFetch, authedJson, formatApiError, safeJson } from "../core/http";
import type { EducationalMonth, Month, MonthPayload, ReorderItem } from "../types/educational-content";

// ============= Student (Public) =============

export async function getMonthsByStage(stageId: string): Promise<Month[]> {
  const res = await authedFetch(`${API_BASE_URL}/educational-content/months/stage/${stageId}`, {
    method: "GET",
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as Month[];
}

export const getEducationalMonths = getMonthsByStage;

export async function getEducationalMonthById(id: string): Promise<EducationalMonth> {
  const res = await authedFetch(`${API_BASE_URL}/educational-content/months/${id}`, {
    method: "GET",
  });

  const data = await safeJson(res);
  if (!res.ok) {
    throw new Error(formatApiError(data));
  }
  return data as EducationalMonth;
}

// ============= Teacher CRUD =============

export async function createMonth(payload: MonthPayload): Promise<Month> {
  return authedJson(`${API_BASE_URL}/educational-content/months`, "POST", payload);
}

export async function updateMonth(id: string, payload: MonthPayload): Promise<Month> {
  return authedJson(`${API_BASE_URL}/educational-content/months/${id}`, "PATCH", payload);
}

export async function deleteMonth(id: string): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/months/${id}`, "DELETE");
}

export async function reorderMonths(items: ReorderItem[]): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/months/reorder`, "PATCH", { items });
}