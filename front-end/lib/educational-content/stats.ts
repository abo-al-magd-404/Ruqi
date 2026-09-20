import { API_BASE_URL, authedFetch, formatApiError, safeJson } from "../core/http";
import { getEducationalStages } from "./stages";
import { getMonthsByStage } from "./months";
import { getContentByMonth } from "./content";
import type { LessonExam, Month, PlatformStats } from "../types/educational-content";

async function getServerStats(): Promise<PlatformStats> {
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

// The server /stats endpoint requires a TEACHER role, which the public landing
// page cannot reach. Fall back to computing the same totals from public reads:
// stages -> months -> content items (LESSON / EXAM).
export async function getPlatformStats(): Promise<PlatformStats> {
  try {
    return await getServerStats();
  } catch {
    // fall through to public computation
  }

  const stages = await getEducationalStages();

  const monthLists = await Promise.all(
    stages.map((stage) => getMonthsByStage(stage._id).catch(() => [] as Month[])),
  );
  const months = monthLists.flat();

  const contentLists = await Promise.all(
    months.map((month) =>
      getContentByMonth(month._id).catch(() => ({ locked: false, items: [] as LessonExam[] })),
    ),
  );

  let lessons = 0;
  let exams = 0;
  for (const content of contentLists) {
    for (const item of content.items) {
      if (item.type === "EXAM") exams++;
      else lessons++;
    }
  }

  return {
    stages: stages.length,
    months: months.length,
    lessons,
    exams,
  };
}