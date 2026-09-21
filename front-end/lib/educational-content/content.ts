// ============= Educational Content: Content =============
// Reads and CRUD for lessons/exams inside a month. Every read is wrapped in
// an in-memory cache (dedupe + short TTL) that is cleared after mutations.
// Student reads: getContentByMonth / getContentById.
// Teacher CRUD: createLesson / createExam / updateContent / deleteContent /
// reorderContent, plus clearContentCache.

import { API_BASE_URL, authedFetch, authedJson, authedWrite, formatApiError, safeJson } from "../core/http";
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

// ============= In-memory cache (dedupe + short TTL) =============

const CACHE_TTL_MS = 15_000;
/* eslint-disable @typescript-eslint/no-explicit-any */
const cache = new Map<string, { promise: Promise<any>; timestamp: number }>();

export function cachedGet<T>(key: string, fetcher: () => Promise<T>): Promise<T> {
  // Cache hit: reuse the promise while it is younger than TTL, so concurrent
  // callers sharing a key issue one request instead of several.
  const record = cache.get(key);
  if (record && Date.now() - record.timestamp < CACHE_TTL_MS) {
    return record.promise;
  }
  const promise = Promise.resolve().then(fetcher);
  cache.set(key, { promise, timestamp: Date.now() });
  // Evict failed requests so a later call can retry; successful entries stay
  // cached until the TTL expires.
  promise.catch(() => {
    if (cache.get(key)?.promise === promise) cache.delete(key);
  });
  return promise;
}

// Must be called after any mutation so the next read reflects fresh data.
export function clearContentCache() {
  cache.clear();
}

// ============= Student (Public) =============

export async function getContentByMonth(monthId: string): Promise<MonthContent> {
  return cachedGet(`content-month:${monthId}`, () =>
    authedFetch(`${API_BASE_URL}/educational-content/content/month/${monthId}`, {
      method: "GET",
    }).then(async (res) => {
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(formatApiError(data));
      }
      // Backend may return a bare array of items or the { locked, items }
      // envelope — normalize both into MonthContent.
      const src = Array.isArray(data)
        ? { locked: false, items: data as LessonExam[] }
        : (data as MonthContent);
      return { locked: src.locked === true, items: src.items ?? [] };
    }),
  );
}

export const getMonthContent = getContentByMonth;

export async function getContentById(id: string): Promise<ContentDetails> {
  return cachedGet(`content:${id}`, () =>
    (async () => {
      // The id may reference a lesson or an exam, so probe the generic
      // /content/:id route first and fall back to /lessons/:id, then
      // /exams/:id. A 404 moves to the next candidate; any other error stops.
      const candidates = [
        `${API_BASE_URL}/educational-content/content/${id}`,
        `${API_BASE_URL}/educational-content/lessons/${id}`,
        `${API_BASE_URL}/educational-content/exams/${id}`,
      ];
      let lastError: Error | null = null;
      for (const url of candidates) {
        let res: Response;
        try {
          res = await authedFetch(url, { method: "GET" });
        } catch (e) {
          lastError = e instanceof Error ? e : new Error("تعذر الاتصال بالخادم");
          continue;
        }
        const data = await safeJson(res).catch(() => ({}));
        if (res.ok) {
          return data as ContentDetails;
        }
        lastError = new Error(formatApiError(data));
        if (res.status !== 404) {
          break;
        }
      }
      throw lastError ?? new Error("تعذر الاتصال بالخادم");
    })(),
  );
}

// ============= Teacher CRUD =============

export async function createLesson(payload: LessonPayload): Promise<LessonExam> {
  const created = await authedJson<LessonExam>(
    `${API_BASE_URL}/educational-content/lessons`,
    "POST",
    payload,
  );
  clearContentCache();
  return created;
}

export async function createExam(payload: ExamPayload): Promise<LessonExam> {
  const created = await authedJson<LessonExam>(
    `${API_BASE_URL}/educational-content/exams`,
    "POST",
    payload,
  );
  clearContentCache();
  return created;
}

export async function updateContent(
  id: string,
  type: ContentType,
  payload: ContentPayload,
): Promise<LessonExam> {
  const specific = `${API_BASE_URL}/educational-content/${type === "LESSON" ? "lessons" : "exams"}/${id}`;
  let updated: LessonExam;
  try {
    updated = await authedJson<LessonExam>(specific, "PATCH", payload);
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      updated = await authedJson<LessonExam>(
        `${API_BASE_URL}/educational-content/content/${id}`,
        "PATCH",
        payload,
      );
    } else {
      throw err;
    }
  }
  clearContentCache();
  return updated;
}

export async function deleteContent(id: string, type: ContentType): Promise<void> {
  const specific = `${API_BASE_URL}/educational-content/${type === "LESSON" ? "lessons" : "exams"}/${id}`;
  try {
    await authedWrite(specific, "DELETE");
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      await authedWrite(`${API_BASE_URL}/educational-content/content/${id}`, "DELETE");
    } else {
      throw err;
    }
  }
  clearContentCache();
}

export async function reorderContent(items: ReorderItem[]): Promise<void> {
  try {
    await authedWrite(`${API_BASE_URL}/educational-content/content/reorder`, "PATCH", { items });
  } catch (err) {
    // Fallback: the bulk reorder endpoint rejected the payload with a
    // "should not exist" error, so apply the same order one item at a time
    // through the normal per-item PATCH endpoint.
    if (!(err instanceof Error && /should not exist/i.test(err.message))) throw err;
    for (const item of items) {
      const details = await getContentById(item.id);
      await updateContent(item.id, details.type, { order: item.order });
    }
  }
  clearContentCache();
}