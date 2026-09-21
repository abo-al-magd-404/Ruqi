// ============= Educational Content: Months =============
// Read + CRUD helpers for the months inside a stage. Public reads go through
// the shared cache (cachedGet); teacher mutations call clearContentCache
// afterwards so the next read reflects the change.

import { API_BASE_URL, authedFetch, authedJson, authedWrite, formatApiError, safeJson } from "../core/http";
import { cachedGet, clearContentCache } from "./content";
import type { EducationalMonth, Month, MonthPayload, ReorderItem } from "../types/educational-content";

// ============= Student (Public) =============

export async function getMonthsByStage(stageId: string): Promise<Month[]> {
  return cachedGet(`months-stage:${stageId}`, () =>
    authedFetch(`${API_BASE_URL}/educational-content/months/stage/${stageId}`, {
      method: "GET",
    }).then(async (res) => {
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(formatApiError(data));
      }
      return data as Month[];
    }),
  );
}

export const getEducationalMonths = getMonthsByStage;

export async function getEducationalMonthById(id: string): Promise<EducationalMonth> {
  return cachedGet(`month:${id}`, () =>
    authedFetch(`${API_BASE_URL}/educational-content/months/${id}`, {
      method: "GET",
    }).then(async (res) => {
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(formatApiError(data));
      }
      return data as EducationalMonth;
    }),
  );
}

// ============= Teacher CRUD =============

export async function createMonth(payload: MonthPayload): Promise<Month> {
  const created = await authedJson<Month>(
    `${API_BASE_URL}/educational-content/months`,
    "POST",
    payload,
  );
  clearContentCache();
  return created;
}

export async function updateMonth(id: string, payload: MonthPayload): Promise<Month> {
  const updated = await authedJson<Month>(
    `${API_BASE_URL}/educational-content/months/${id}`,
    "PATCH",
    payload,
  );
  clearContentCache();
  return updated;
}

export async function deleteMonth(id: string): Promise<void> {
  await authedWrite(`${API_BASE_URL}/educational-content/months/${id}`, "DELETE");
  clearContentCache();
}

export async function reorderMonths(items: ReorderItem[]): Promise<void> {
  try {
    await authedWrite(`${API_BASE_URL}/educational-content/months/reorder`, "PATCH", { items });
  } catch (err) {
    // Bulk reorder rejected ("should not exist") — fall back to applying
    // each item's order through its individual PATCH endpoint.
    if (!(err instanceof Error && /should not exist/i.test(err.message))) throw err;
    for (const item of items) {
      await authedJson(`${API_BASE_URL}/educational-content/months/${item.id}`, "PATCH", {
        order: item.order,
      });
    }
  }
  clearContentCache();
}