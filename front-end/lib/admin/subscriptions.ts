// ============= Admin: Subscriptions =============
// Admin helpers to read, add, and remove the months a student is
// subscribed to. All return the updated subscribedMonths list.

import { API_BASE_URL, authedJson } from "../core/http";
import type { AdminMonthRef, SubscribedMonthsResult } from "../types/admin";

export async function getSubscribedMonths(
  studentId: string,
): Promise<SubscribedMonthsResult["student"]> {
  const res = await authedJson<{
    message: string;
    student: SubscribedMonthsResult["student"];
  }>(`${API_BASE_URL}/admin/students/${studentId}/subscribed-months`, "GET");
  return res.student;
}

export async function addSubscribedMonth(
  studentId: string,
  monthId: string,
): Promise<AdminMonthRef[]> {
  const res = await authedJson<{
    message: string;
    student: { subscribedMonths: AdminMonthRef[] };
  }>(`${API_BASE_URL}/admin/students/${studentId}/subscribed-months`, "POST", {
    monthId,
  });
  return res.student?.subscribedMonths ?? [];
}

export async function removeSubscribedMonth(
  studentId: string,
  monthId: string,
): Promise<AdminMonthRef[]> {
  const res = await authedJson<{
    message: string;
    student: { subscribedMonths: AdminMonthRef[] };
  }>(`${API_BASE_URL}/admin/students/${studentId}/subscribed-months`, "DELETE", {
    monthId,
  });
  return res.student?.subscribedMonths ?? [];
}
