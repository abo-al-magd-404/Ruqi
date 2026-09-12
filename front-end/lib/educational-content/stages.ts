import { API_BASE_URL, authedJson, formatApiError, safeJson } from "../core/http";
import type { EducationalStage, ReorderItem, StagePayload } from "../types/educational-content";

// ============= Student (Public) =============

export async function getEducationalStages(): Promise<EducationalStage[]> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/stages`, {
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
  return data as EducationalStage[];
}

export async function getEducationalStageById(id: string): Promise<EducationalStage> {
  let res: Response;
  try {
    res = await fetch(`${API_BASE_URL}/educational-content/stages/${id}`, {
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
  return data as EducationalStage;
}

// ============= Teacher CRUD =============

export async function createStage(payload: StagePayload): Promise<EducationalStage> {
  return authedJson(`${API_BASE_URL}/educational-content/stages`, "POST", payload);
}

export async function updateStage(id: string, payload: StagePayload): Promise<EducationalStage> {
  return authedJson(`${API_BASE_URL}/educational-content/stages/${id}`, "PATCH", payload);
}

export async function deleteStage(id: string): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/stages/${id}`, "DELETE");
}

export async function reorderStages(items: ReorderItem[]): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/educational-content/stages/reorder`, "PATCH", { items });
}