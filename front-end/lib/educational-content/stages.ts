import { API_BASE_URL, authedJson, authedWrite, formatApiError, safeJson } from "../core/http";
import { cachedGet, clearContentCache } from "./content";
import type { EducationalStage, ReorderItem, StagePayload } from "../types/educational-content";

// ============= Student (Public) =============

export async function getEducationalStages(): Promise<EducationalStage[]> {
  return cachedGet("stages", () =>
    fetch(`${API_BASE_URL}/educational-content/stages`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(async (res) => {
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(formatApiError(data));
      }
      return data as EducationalStage[];
    }),
  );
}

export async function getEducationalStageById(id: string): Promise<EducationalStage> {
  return cachedGet(`stage:${id}`, () =>
    fetch(`${API_BASE_URL}/educational-content/stages/${id}`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }).then(async (res) => {
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(formatApiError(data));
      }
      return data as EducationalStage;
    }),
  );
}

// ============= Teacher CRUD =============

export async function createStage(payload: StagePayload): Promise<EducationalStage> {
  const created = await authedJson<EducationalStage>(
    `${API_BASE_URL}/educational-content/stages`,
    "POST",
    payload,
  );
  clearContentCache();
  return created;
}

export async function updateStage(id: string, payload: StagePayload): Promise<EducationalStage> {
  const updated = await authedJson<EducationalStage>(
    `${API_BASE_URL}/educational-content/stages/${id}`,
    "PATCH",
    payload,
  );
  clearContentCache();
  return updated;
}

export async function deleteStage(id: string): Promise<void> {
  await authedWrite(`${API_BASE_URL}/educational-content/stages/${id}`, "DELETE");
  clearContentCache();
}

export async function reorderStages(items: ReorderItem[]): Promise<void> {
  await authedWrite(`${API_BASE_URL}/educational-content/stages/reorder`, "PATCH", { items });
  clearContentCache();
}