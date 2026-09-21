import {
  API_BASE_URL,
  authedFetch,
  formatApiError,
  safeJson,
} from "../core/http";
import { clearTokens } from "../tokens/tokens";

import type {
  UserProfile,
  UpdateStudentProfilePayload,
} from "../types/account";

function normalizeProfile(data: unknown): UserProfile {
  const src =
    data &&
    typeof data === "object" &&
    "user" in (data as Record<string, unknown>)
      ? ((data as Record<string, unknown>).user as Record<string, unknown>)
      : (data as Record<string, unknown>);

  const raw = Array.isArray(src) ? (src[0] as Record<string, unknown>) : src;

  const rawStage = raw?.stage ?? raw?.educationalStage;
  const stageId =
    rawStage && typeof rawStage === "object"
      ? String(
          (rawStage as Record<string, unknown>)._id ??
            (rawStage as Record<string, unknown>).id ??
            "",
        )
      : String(rawStage ?? "");

  return {
    _id: String(raw?._id ?? raw?.id ?? ""),
    studentId: String(raw?.studentId ?? ""),
    name: String(raw?.name ?? ""),
    email: String(raw?.email ?? ""),
    phoneNumber: String(raw?.phoneNumber ?? ""),
    address: String(raw?.address ?? ""),
    role: String(raw?.role ?? ""),
    status: String(raw?.status ?? ""),
    stage: stageId,
    avatar: String(raw?.avatar ?? ""),
    subscribedMonths: Array.isArray(raw?.subscribedMonths)
      ? (raw.subscribedMonths as unknown[]).map((m) =>
          m && typeof m === "object"
            ? String((m as Record<string, unknown>)._id ?? "")
            : String(m ?? ""),
        )
      : [],
    createdAt: String(raw?.createdAt ?? ""),
    updatedAt: String(raw?.updatedAt ?? ""),
  };
}

export async function getProfile(): Promise<UserProfile> {
  const res = await authedFetch(`${API_BASE_URL}/users/me`);
  const data = await safeJson(res);

  if (!res.ok) {
    if (res.status === 401) clearTokens();
    throw new Error(formatApiError(data));
  }

  return normalizeProfile(data);
}

export async function updateStudentProfile(
  payload: UpdateStudentProfilePayload,
): Promise<UserProfile> {
  const body: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(payload)) {
    if (value !== undefined && value !== null && String(value).trim() !== "") {
      body[key] = value;
    }
  }

  const res = await authedFetch(`${API_BASE_URL}/users/student/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const data = await safeJson(res);

  if (!res.ok) {
    if (res.status === 401) clearTokens();
    throw new Error(formatApiError(data));
  }

  return normalizeProfile(data);
}
