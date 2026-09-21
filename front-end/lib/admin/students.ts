// ============= Admin: Students =============
// Admin-only REST helpers for listing, viewing, updating, and deleting
// students, plus toggling their account status.

import { API_BASE_URL, authedJson } from "../core/http";
import type {
  AdminStudent,
  UpdateStudentPayload,
  UpdateStudentStatusPayload,
  UserStatus,
} from "../types/admin";

// Normalize raw backend shapes (nested stage object, missing studentId,
// non-array subscribedMonths) into the AdminStudent contract.
function normalizeStudent(raw: AdminStudent): AdminStudent {
  return {
    ...raw,
    _id: String(raw?._id ?? ""),
    studentId: raw?.studentId ? String(raw.studentId) : undefined,
    avatar: raw?.avatar ?? "",
    stage:
      raw?.stage && typeof raw.stage === "object"
        ? { _id: String(raw.stage._id), title: String(raw.stage.title) }
        : raw?.stage
          ? String(raw.stage)
          : null,
    subscribedMonths: Array.isArray(raw?.subscribedMonths)
      ? raw.subscribedMonths
      : [],
  };
}

export async function getStudents(): Promise<AdminStudent[]> {
  const res = await authedJson<{ message: string; students: AdminStudent[] }>(
    `${API_BASE_URL}/admin/students`,
    "GET",
  );
  return (res.students ?? []).map(normalizeStudent);
}

export async function getStudent(studentId: string): Promise<AdminStudent> {
  const res = await authedJson<{ message: string; student: AdminStudent }>(
    `${API_BASE_URL}/admin/students/${studentId}`,
    "GET",
  );
  return normalizeStudent(res.student);
}

export async function updateStudent(
  studentId: string,
  payload: UpdateStudentPayload,
): Promise<AdminStudent> {
  const body: Record<string, unknown> = {};
  // Drop empty values so a partial update never clobbers existing fields.
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      body[key] = value;
    }
  }
  const res = await authedJson<{ message: string; student: AdminStudent }>(
    `${API_BASE_URL}/admin/students/${studentId}`,
    "PATCH",
    body,
  );
  return normalizeStudent(res.student);
}

export async function updateStudentStatus(
  studentId: string,
  status: UserStatus,
): Promise<AdminStudent> {
  const payload: UpdateStudentStatusPayload = { status };
  const res = await authedJson<{ message: string; student: AdminStudent }>(
    `${API_BASE_URL}/admin/students/${studentId}/status`,
    "PATCH",
    payload,
  );
  return normalizeStudent(res.student);
}

export async function deleteStudent(studentId: string): Promise<{ message: string }> {
  return authedJson(`${API_BASE_URL}/admin/students/${studentId}`, "DELETE");
}
