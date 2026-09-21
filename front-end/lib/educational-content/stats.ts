// ============= Educational Content: Stats =============
// Fetches aggregated platform counters (stages / months / lessons / exams)
// used on landing and about pages.

import { API_BASE_URL, authedFetch, formatApiError, safeJson } from "../core/http";
import type { PlatformStats } from "../types/educational-content";

// Counts stages, then for each stage its months, then for each month its
// lessons + exams, using only the publicly reachable endpoints. This keeps the
// landing-page counters working for anonymous visitors and students, since the
// dedicated "stats" endpoint on the backend is restricted to TEACHERs.
async function aggregatePublicStats(): Promise<PlatformStats> {
  const stagesResponse = await fetch(`${API_BASE_URL}/educational-content/stages`);
  const stagesData = await safeJson(stagesResponse);
  const stages = Array.isArray(stagesData) ? stagesData : [];

  let monthsCount = 0;
  let lessonsCount = 0;
  let examsCount = 0;

  await Promise.all(
    stages.map(async (stage: { _id?: string }) => {
      if (!stage?._id) return;
      const monthsResponse = await fetch(
        `${API_BASE_URL}/educational-content/months/stage/${stage._id}`
      );
      const monthsData = await safeJson(monthsResponse);
      const months = Array.isArray(monthsData) ? monthsData : [];
      monthsCount += months.length;

      await Promise.all(
        months.map(async (month: { _id?: string }) => {
          if (!month?._id) return;
          const [lessonsResponse, examsResponse] = await Promise.all([
            fetch(`${API_BASE_URL}/educational-content/lessons/month/${month._id}`),
            fetch(`${API_BASE_URL}/educational-content/exams/month/${month._id}`),
          ]);
          const lessonsData = await safeJson(lessonsResponse);
          const examsData = await safeJson(examsResponse);
          if (Array.isArray(lessonsData)) lessonsCount += lessonsData.length;
          if (Array.isArray(examsData)) examsCount += examsData.length;
        })
      );
    })
  );

  return {
    stages: stages.length,
    months: monthsCount,
    lessons: lessonsCount,
    exams: examsCount,
  };
}

export async function getPlatformStats(): Promise<PlatformStats> {
  let res: Response;
  try {
    res = await authedFetch(`${API_BASE_URL}/educational-content/stats`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    });
  } catch {
    // Teacher-only endpoint unreachable (e.g. no session) -> fall back to the
    // public counters so the landing page still shows data.
    return aggregatePublicStats();
  }

  const data = await safeJson(res);
  if (!res.ok) {
    // Same fallback for 401 (anonymous) and 403 (non-teacher roles).
    if (res.status === 401 || res.status === 403) return aggregatePublicStats();
    throw new Error(formatApiError(data));
  }

  // Backend may return the counters under a "data" envelope or directly.
  const inner =
    data && typeof data === "object" && "data" in (data as Record<string, unknown>)
      ? (data as Record<string, unknown>).data
      : data;

  // Accept several possible key names per counter (e.g. "stages" vs
  // "stagesCount") and default to 0 when a value is missing or not numeric.
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