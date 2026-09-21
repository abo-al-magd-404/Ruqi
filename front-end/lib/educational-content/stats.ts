import {
  API_BASE_URL,
  authedFetch,
  formatApiError,
  safeJson,
} from "../core/http";
import type { PlatformStats } from "../types/educational-content";

async function aggregatePublicStats(): Promise<PlatformStats> {
  const stagesResponse = await fetch(
    `${API_BASE_URL}/educational-content/stages`,
  );
  const stagesData = await safeJson(stagesResponse);
  const stages = Array.isArray(stagesData) ? stagesData : [];

  let monthsCount = 0;
  let lessonsCount = 0;
  let examsCount = 0;

  await Promise.all(
    stages.map(async (stage: { _id?: string }) => {
      if (!stage?._id) return;
      const monthsResponse = await fetch(
        `${API_BASE_URL}/educational-content/months/stage/${stage._id}`,
      );
      const monthsData = await safeJson(monthsResponse);
      const months = Array.isArray(monthsData) ? monthsData : [];
      monthsCount += months.length;

      await Promise.all(
        months.map(async (month: { _id?: string }) => {
          if (!month?._id) return;
          const [lessonsResponse, examsResponse] = await Promise.all([
            fetch(
              `${API_BASE_URL}/educational-content/lessons/month/${month._id}`,
            ),
            fetch(
              `${API_BASE_URL}/educational-content/exams/month/${month._id}`,
            ),
          ]);
          const lessonsData = await safeJson(lessonsResponse);
          const examsData = await safeJson(examsResponse);
          if (Array.isArray(lessonsData)) lessonsCount += lessonsData.length;
          if (Array.isArray(examsData)) examsCount += examsData.length;
        }),
      );
    }),
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
    return aggregatePublicStats();
  }

  const data = await safeJson(res);
  if (!res.ok) {
    if (res.status === 401 || res.status === 403) return aggregatePublicStats();
    throw new Error(formatApiError(data));
  }

  const inner =
    data &&
    typeof data === "object" &&
    "data" in (data as Record<string, unknown>)
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
