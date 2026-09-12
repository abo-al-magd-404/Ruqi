import { API_BASE_URL } from "./core/http";
import type { StudentRank } from "./types/leaderboard";

export async function getLeaderboard(tab: string): Promise<StudentRank[]> {
  const response = await fetch(
    `${API_BASE_URL}/leaderboard?tab=${encodeURIComponent(tab)}`
  );

  if (!response.ok) {
    throw new Error("تعذر تحميل لوحة الشرف");
  }

  const data = await response.json();
  return Array.isArray(data) ? data : Array.isArray(data?.students) ? data.students : [];
}