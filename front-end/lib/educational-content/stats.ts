import { API_BASE_URL, authedFetch, formatApiError, safeJson } from "../core/http";
import type { PlatformStats } from "../types/educational-content";

export async function getPlatformStats(): Promise<PlatformStats> {
  let res: Response;
  try {
    res = await authedFetch(`${API_BASE_URL}/educational-content/stats`, {
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

  const inner =
    data && typeof data === "object" && "data" in (data as Record<string, unknown>)
      ? (data as Record<string, unknown>).data
      : data;

  const pickNumber = (value: unknown, keys: string[]): number => {
    const record =
      value && typeof value === "object"
        ? (value as Record<string, unknown>)
        : {};
    for (const key of keys) {
      const num = Number(record[key]);
      if (Number.isFinite(num)) return num;
    }
    return 0;
  };

  return {
    stages: pickNumber(inner, ["stages", "stagesCount"]),
    months: pickNumber(inner, ["months", "monthsCount"]),
    lessons: pickNumber(inner, ["lessons", "lessonsCount"]),
    exams: pickNumber(inner, ["exams", "examsCount"]),
  };
}