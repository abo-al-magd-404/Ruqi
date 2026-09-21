import {
  API_BASE_URL,
  authedFetch,
  authedJson,
  authedWrite,
  formatApiError,
  safeJson,
} from "../core/http";
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

const CACHE_TTL_MS = 15_000;
const cache = new Map<
  string,
  { promise: Promise<unknown>; timestamp: number }
>();

export function cachedGet<T>(
  key: string,
  fetcher: () => Promise<T>,
): Promise<T> {
  const record = cache.get(key);
  if (record && Date.now() - record.timestamp < CACHE_TTL_MS) {
    return record.promise as Promise<T>;
  }
  const promise = Promise.resolve().then(fetcher);
  cache.set(key, { promise, timestamp: Date.now() });
  promise.catch(() => {
    if (cache.get(key)?.promise === promise) cache.delete(key);
  });
  return promise;
}

export function clearContentCache() {
  cache.clear();
}

export async function getContentByMonth(
  monthId: string,
): Promise<MonthContent> {
  return cachedGet(`content-month:${monthId}`, () =>
    authedFetch(
      `${API_BASE_URL}/educational-content/content/month/${monthId}`,
      {
        method: "GET",
      },
    ).then(async (res) => {
      const data = await safeJson(res);
      if (!res.ok) {
        throw new Error(formatApiError(data));
      }
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
          lastError =
            e instanceof Error ? e : new Error("تعذر الاتصال بالخادم");
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

export async function createLesson(
  payload: LessonPayload,
): Promise<LessonExam> {
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

export async function deleteContent(
  id: string,
  type: ContentType,
): Promise<void> {
  const specific = `${API_BASE_URL}/educational-content/${type === "LESSON" ? "lessons" : "exams"}/${id}`;
  try {
    await authedWrite(specific, "DELETE");
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 404) {
      await authedWrite(
        `${API_BASE_URL}/educational-content/content/${id}`,
        "DELETE",
      );
    } else {
      throw err;
    }
  }
  clearContentCache();
}

export async function reorderContent(items: ReorderItem[]): Promise<void> {
  try {
    await authedWrite(
      `${API_BASE_URL}/educational-content/content/reorder`,
      "PATCH",
      { items },
    );
  } catch (err) {
    if (!(err instanceof Error && /should not exist/i.test(err.message)))
      throw err;
    for (const item of items) {
      const details = await getContentById(item.id);
      await updateContent(item.id, details.type, { order: item.order });
    }
  }
  clearContentCache();
}
