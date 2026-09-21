// ============= Student Progress: Months =============
// Reads the aggregated progress of a whole month (all lessons + exams).

import { API_BASE_URL, authedJson } from "../core/http";
import type { MonthProgress } from "../types/progress";

export async function getMonthProgress(monthId: string): Promise<MonthProgress> {
  const res = await authedJson<{ data: MonthProgress }>(
    `${API_BASE_URL}/progress/months/${monthId}`,
    "GET",
  );
  return res.data;
}
