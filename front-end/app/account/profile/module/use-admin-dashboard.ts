"use client";

// Admin dashboard data layer (backing the admin-dashboard UI). Loads the
// students + educational stages, keeps the search and selected-student state,
// and exposes the admin mutations: toggling month subscriptions, editing
// students, changing account status and deleting accounts.
import { useCallback, useEffect, useState } from "react";
import {
  deleteStudent,
  getStudents,
  updateStudent,
  updateStudentStatus,
} from "@/lib/admin/students";
import { addSubscribedMonth, removeSubscribedMonth } from "@/lib/admin/subscriptions";
import { getMonthsByStage } from "@/lib/educational-content/months";
import { getEducationalStages } from "@/lib/educational-content/stages";
import type {
  AdminMonthRef,
  AdminStudent,
  UpdateStudentPayload,
  UserStatus,
} from "@/lib/types/admin";
import type { EducationalStage, Month } from "@/lib/types/educational-content";

// Helpers that normalize a student's polymorphic stage / subscribedMonths fields
// into plain strings, plus small selectors used by the dashboard UI.
export function studentStageId(student: AdminStudent | null): string | null {
  if (!student) return null;
  if (student.stage && typeof student.stage === "object") return String(student.stage._id);
  if (typeof student.stage === "string" && student.stage) return student.stage;
  return null;
}

export function studentStageTitle(student: AdminStudent | null): string {
  if (!student) return "—";
  if (student.stage && typeof student.stage === "object") return String(student.stage.title);
  return "—";
}

export function studentSubscribedIds(student: AdminStudent | null): string[] {
  if (!student?.subscribedMonths) return [];
  return (student.subscribedMonths as (AdminMonthRef | string)[]).map((m) =>
    m && typeof m === "object" ? String(m._id) : String(m),
  );
}

export function useAdminDashboard() {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [allStages, setAllStages] = useState<EducationalStage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<AdminStudent | null>(null);

  const [stageMonths, setStageMonths] = useState<Month[]>([]);
  const [loadingMonths, setLoadingMonths] = useState(false);
  const [busy, setBusy] = useState(false);

  // Initial load: fetch students + the sorted stage list, then default the
  // selection to the first student (kept in sync after every reload).
  const loadStudents = useCallback(async () => {
    try {
      const [data, stages] = await Promise.all([
        getStudents(),
        getEducationalStages().catch(() => [] as EducationalStage[]),
      ]);
      setStudents(data);
      setAllStages([...stages].sort((a, b) => a.order - b.order));
      setError(null);
      setSelected((current) => {
        if (!current) return data[0] ?? null;
        return data.find((s) => s.studentId === current.studentId) ?? data[0] ?? null;
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : "تعذر تحميل بيانات الطلاب");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadStudents();
    })();
  }, [loadStudents]);

  const stageId = studentStageId(selected);

  // Whenever the selected student (and thus their stage) changes, fetch that
  // stage's months so subscriptions can be toggled per month.
  useEffect(() => {
    let active = true;
    (async () => {
      if (!stageId) {
        if (active) setStageMonths([]);
        return;
      }
      if (active) setLoadingMonths(true);
      try {
        const months = await getMonthsByStage(stageId);
        if (active) setStageMonths([...months].sort((a, b) => a.order - b.order));
      } catch {
        if (active) setStageMonths([]);
      } finally {
        if (active) setLoadingMonths(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [stageId]);

  // Client-side search over id, name and email.
  const filteredStudents = students.filter((s) => {
    const term = search.trim();
    if (!term) return true;
    return (
      (s.studentId ?? "").toLowerCase().includes(term.toLowerCase()) ||
      s.name.toLowerCase().includes(term.toLowerCase()) ||
      s.email.toLowerCase().includes(term.toLowerCase())
    );
  });

  // Toggle a month subscription: unsubscribe when already subscribed, subscribe
  // otherwise. Updated months are patched into both lists (table + selection).
  const applySubscription = useCallback(
    async (studentId: string, monthId: string, isSubscribed: boolean) => {
      setBusy(true);
      try {
        const updatedMonths = isSubscribed
          ? await removeSubscribedMonth(studentId, monthId)
          : await addSubscribedMonth(studentId, monthId);
        const patch = (s: AdminStudent): AdminStudent =>
          s.studentId === studentId ? { ...s, subscribedMonths: updatedMonths } : s;
        setStudents((prev) => prev.map(patch));
        setSelected((prev) => (prev ? patch(prev) : prev));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذر تحديث الاشتراك");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const saveStudent = useCallback(
    async (studentId: string, payload: UpdateStudentPayload) => {
      setBusy(true);
      try {
        const updated = await updateStudent(studentId, payload);
        const patch = (s: AdminStudent): AdminStudent =>
          s.studentId === studentId ? { ...s, ...updated } : s;
        setStudents((prev) => prev.map(patch));
        setSelected((prev) => (prev ? patch(prev) : prev));
        setError(null);
        return true;
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذر حفظ بيانات الطالب");
        return false;
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const changeStatus = useCallback(
    async (studentId: string, status: UserStatus) => {
      setBusy(true);
      try {
        const updated = await updateStudentStatus(studentId, status);
        const patch = (s: AdminStudent): AdminStudent =>
          s.studentId === studentId ? { ...s, ...updated } : s;
        setStudents((prev) => prev.map(patch));
        setSelected((prev) => (prev ? patch(prev) : prev));
        setError(null);
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذر تحديث حالة الحساب");
      } finally {
        setBusy(false);
      }
    },
    [],
  );

  const removeStudent = useCallback(
    async (studentId: string) => {
      setBusy(true);
      try {
        await deleteStudent(studentId);
        setError(null);
        await loadStudents();
      } catch (e) {
        setError(e instanceof Error ? e.message : "تعذر حذف الحساب");
      } finally {
        setBusy(false);
      }
    },
    [loadStudents],
  );

  // Aggregates backing the dashboard stat cards.
  const activeCount = students.filter((s) => s.status === "ACTIVE").length;
  const subscriptionsCount = students.reduce(
    (total, s) => total + (s.subscribedMonths?.length ?? 0),
    0,
  );

  return {
    students,
    allStages,
    filteredStudents,
    loading,
    error,
    search,
    setSearch,
    selected,
    setSelected,
    stageMonths,
    loadingMonths,
    busy,
    activeCount,
    subscriptionsCount,
    applySubscription,
    saveStudent,
    changeStatus,
    removeStudent,
  };
}
