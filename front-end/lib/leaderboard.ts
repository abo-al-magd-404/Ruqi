import { API_BASE_URL } from "./core/http";
import { cachedGet } from "./educational-content/content";
import type { StudentRank } from "./types/leaderboard";

export interface LeaderboardStage {
  _id: string;
  title: string;
}

interface LeaderboardStudent {
  rank: number;
  studentId: string;
  name: string;
  avatar?: string | null;
  stage?: string | null;
  totalPoints: number;
}

function normalizeStudent(raw: LeaderboardStudent, fallbackStage?: string): StudentRank {
  return {
    id: raw.studentId,
    name: raw.name,
    stage: raw.stage ?? fallbackStage ?? "",
    points: raw.totalPoints,
    rank: raw.rank,
    imageUrl: raw.avatar ?? "",
  };
}

export async function getLeaderboardStages(): Promise<LeaderboardStage[]> {
  const res = await fetch(`${API_BASE_URL}/leaderboard/stages`);
  if (!res.ok) throw new Error("تعذر تحميل المراحل");
  const data = await res.json();
  const list = Array.isArray(data) ? data : (data as { data?: unknown }).data;
  return Array.isArray(list) ? (list as LeaderboardStage[]) : [];
}

export async function getOverallTopStudents(): Promise<StudentRank[]> {
  return cachedGet("leaderboard:top", () =>
    fetch(`${API_BASE_URL}/leaderboard/top-students`).then(async (res) => {
      if (!res.ok) throw new Error("تعذر تحميل لوحة الشرف");
      const data = await res.json();
      const list = Array.isArray(data) ? data : (data as { data?: unknown }).data;
      return Array.isArray(list)
        ? (list as LeaderboardStudent[]).map((s) => normalizeStudent(s))
        : [];
    }),
  );
}

export async function getStageTopStudents(stageId: string): Promise<StudentRank[]> {
  const res = await fetch(`${API_BASE_URL}/leaderboard/stages/${stageId}/top-students`);
  if (!res.ok) throw new Error("تعذر تحميل لوحة الشرف");
  const data = await res.json();
  const inner = Array.isArray(data) ? data : (data as { data?: unknown }).data;
  const students = Array.isArray(inner)
    ? inner
    : (inner as { students?: unknown } | undefined)?.students;
  return Array.isArray(students)
    ? (students as LeaderboardStudent[]).map((s) => normalizeStudent(s))
    : [];
}

export async function getLeaderboard(stageId?: string): Promise<StudentRank[]> {
  return stageId ? getStageTopStudents(stageId) : getOverallTopStudents();
}