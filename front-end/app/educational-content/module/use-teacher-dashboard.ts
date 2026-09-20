import { useCallback, useEffect, useState } from "react";
import {
  getEducationalStages,
  createStage,
  updateStage,
  deleteStage,
  reorderStages,
} from "@/lib/educational-content/stages";
import {
  getMonthsByStage,
  createMonth,
  updateMonth,
  deleteMonth,
  reorderMonths,
} from "@/lib/educational-content/months";
import {
  getContentByMonth,
  createLesson,
  createExam,
  updateContent,
  deleteContent,
  reorderContent,
} from "@/lib/educational-content/content";
import type {
  ContentQuestion,
  ContentType,
  EducationalStage,
  LessonExam,
  Month,
} from "@/lib/types/educational-content";
import type {
  ContentFormValues,
  DeleteTarget,
  ModalMode,
  MonthFormValues,
  StageFormValues,
} from "./teacher-dashboard.types";

function validateQuestion(q: ContentQuestion): string | null {
  if (!q.questionText.trim()) return "أحد الأسئلة لا يحتوي على نص السؤال";
  if (q.options.length < 2) return "يجب أن يحتوي كل سؤال على خيارين على الأقل";
  if (q.correctAnswers.length < 1) return "يجب تحديد إجابة صحيحة واحدة على الأقل لكل سؤال";
  if (q.correctAnswers.some((c) => !Number.isInteger(c) || c < 0 || c >= q.options.length))
    return "إحدى الإجابات الصحيحة غير موجودة ضمن الخيارات";
  return null;
}

export function useTeacherDashboard() {
  const [stages, setStages] = useState<EducationalStage[]>([]);
  const [loadingStages, setLoadingStages] = useState(true);
  const [selectedStageId, setSelectedStageId] = useState<string | null>(null);

  const [months, setMonths] = useState<Month[]>([]);
  const [loadingMonths, setLoadingMonths] = useState(true);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  const [content, setContent] = useState<LessonExam[]>([]);
  const [loadingContent, setLoadingContent] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [stageModalOpen, setStageModalOpen] = useState(false);
  const [stageModalMode, setStageModalMode] = useState<ModalMode>("create");
  const [editingStage, setEditingStage] = useState<EducationalStage | null>(null);

  const [monthModalOpen, setMonthModalOpen] = useState(false);
  const [monthModalMode, setMonthModalMode] = useState<ModalMode>("create");
  const [editingMonth, setEditingMonth] = useState<Month | null>(null);

  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [contentModalMode, setContentModalMode] = useState<ModalMode>("create");
  const [editingContent, setEditingContent] = useState<LessonExam | null>(null);
  const [contentType, setContentType] = useState<ContentType>("LESSON");

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);

  // ---- Load stages ----
  const loadStages = useCallback(async () => {
    try {
      const data = await getEducationalStages();
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setStages(sorted);
      setError(null);
      if (sorted.length > 0 && !selectedStageId) {
        setSelectedStageId(sorted[0]._id);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل المراحل");
    } finally {
      setLoadingStages(false);
    }
  }, [selectedStageId]);

  useEffect(() => {
    (async () => {
      await loadStages();
    })();
  }, [loadStages]);

  // ---- Load months for selected stage ----
  const loadMonths = useCallback(async (stageId: string | null) => {
    if (!stageId) {
      setMonths([]);
      setContent([]);
      setSelectedMonthId(null);
      return;
    }
    try {
      const data = await getMonthsByStage(stageId);
      const sorted = [...data].sort((a, b) => a.order - b.order);
      setMonths(sorted);
      setError(null);
      setSelectedMonthId(sorted.length > 0 ? sorted[0]._id : null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل الأشهر");
      setMonths([]);
      setSelectedMonthId(null);
    } finally {
      setLoadingMonths(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadMonths(selectedStageId);
    })();
  }, [selectedStageId, loadMonths]);

  // ---- Load content for selected month ----
  const loadContent = useCallback(async (monthId: string | null) => {
    if (!monthId) {
      setContent([]);
      return;
    }
    try {
      const data = await getContentByMonth(monthId);
      setContent([...data.items].sort((a, b) => a.order - b.order));
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء تحميل المحتوى");
      setContent([]);
    } finally {
      setLoadingContent(false);
    }
  }, []);

  useEffect(() => {
    (async () => {
      await loadContent(selectedMonthId);
    })();
  }, [selectedMonthId, loadContent]);

  const selectedStage = stages.find((s) => s._id === selectedStageId) ?? null;
  const selectedMonth = months.find((m) => m._id === selectedMonthId) ?? null;

  const selectStage = (id: string) => {
    setSelectedStageId(id);
    setLoadingMonths(true);
  };

  const selectMonth = (id: string) => {
    setSelectedMonthId(id);
    setLoadingContent(true);
  };

  // ============ Helper: reorder array locally + call API ============
  const moveItem = async <T extends { _id: string; order: number }>(
    list: T[],
    index: number,
    dir: -1 | 1,
    setList: (items: T[]) => void,
    apiFn: (items: { id: string; order: number }[]) => Promise<unknown>,
    reload: () => Promise<void>,
  ) => {
    const target = index + dir;
    if (target < 0 || target >= list.length) return;
    const reordered = [...list];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(target, 0, moved);
    const updated = reordered.map((item, i) => ({ ...item, order: i }));
    setList(updated);
    try {
      await apiFn(updated.map((item) => ({ id: item._id, order: item.order })));
    } catch (e) {
      await reload();
      setError(e instanceof Error ? e.message : "حدث خطأ أثناء إعادة الترتيب");
    }
  };

  const moveStage = (index: number, dir: -1 | 1) =>
    moveItem(stages, index, dir, setStages, reorderStages, loadStages);
  const moveMonth = (index: number, dir: -1 | 1) =>
    moveItem(months, index, dir, setMonths, reorderMonths, () => loadMonths(selectedStageId));
  const moveContent = (index: number, dir: -1 | 1) =>
    moveItem(content, index, dir, setContent, reorderContent, () => loadContent(selectedMonthId));

  // ============ Stage handlers ============
  const openStageCreate = () => {
    setStageModalMode("create");
    setEditingStage(null);
    setModalError(null);
    setStageModalOpen(true);
  };

  const openStageEdit = (stage: EducationalStage) => {
    setStageModalMode("edit");
    setEditingStage(stage);
    setModalError(null);
    setStageModalOpen(true);
  };

  const handleStageSave = async (data: StageFormValues) => {
    setSaving(true);
    setModalError(null);
    try {
      if (stageModalMode === "create") {
        await createStage({ title: data.title, image: data.image || undefined });
      } else if (editingStage) {
        await updateStage(editingStage._id, { title: data.title, image: data.image || undefined });
      }
      await loadStages();
      setStageModalOpen(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ المرحلة");
    } finally {
      setSaving(false);
    }
  };

  // ============ Month handlers ============
  const openMonthCreate = () => {
    setMonthModalMode("create");
    setEditingMonth(null);
    setModalError(null);
    setMonthModalOpen(true);
  };

  const openMonthEdit = (month: Month) => {
    setMonthModalMode("edit");
    setEditingMonth(month);
    setModalError(null);
    setMonthModalOpen(true);
  };

  const handleMonthSave = async (data: MonthFormValues) => {
    if (!selectedStageId) return;
    setSaving(true);
    setModalError(null);
    try {
      if (monthModalMode === "create") {
        await createMonth({
          title: data.title,
          description: data.description,
          price: data.price,
          image: data.image || undefined,
          stage: selectedStageId,
        });
      } else if (editingMonth) {
        await updateMonth(editingMonth._id, {
          title: data.title,
          description: data.description,
          price: data.price,
          image: data.image || undefined,
        });
      }
      await loadMonths(selectedStageId);
      setMonthModalOpen(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ الشهر");
    } finally {
      setSaving(false);
    }
  };

  // ============ Content handlers ============
  const openExamCreate = () => {
    setContentModalMode("create");
    setEditingContent(null);
    setContentType("EXAM");
    setModalError(null);
    setContentModalOpen(true);
  };

  const openLessonCreate = () => {
    setContentModalMode("create");
    setEditingContent(null);
    setContentType("LESSON");
    setModalError(null);
    setContentModalOpen(true);
  };

  const openContentEdit = (item: LessonExam) => {
    setContentModalMode("edit");
    setEditingContent(item);
    setContentType(item.type);
    setModalError(null);
    setContentModalOpen(true);
  };

  const handleContentSave = async (data: ContentFormValues) => {
    if (!selectedMonthId) return;
    const meaningfulQuestions = data.questions.filter(
      (q) =>
        q.questionText.trim() ||
        q.options.some((o) => o.trim()) ||
        q.correctAnswers.length > 0,
    );
    for (const q of meaningfulQuestions) {
      const qError = validateQuestion(q);
      if (qError) {
        setModalError(qError);
        return;
      }
    }
    const validQuestions = meaningfulQuestions;

    if (!data.description.trim()) {
      setModalError("الوصف إلزامي");
      return;
    }

    if (contentType === "LESSON" && contentModalMode === "create") {
      if (!data.videoUrl?.trim()) {
        setModalError("رابط الفيديو إلزامي لإنشاء الدرس");
        return;
      }
      if (!data.writtenExplanation?.trim()) {
        setModalError("الشرح المكتوب إلزامي لإنشاء الدرس");
        return;
      }
    }

    setSaving(true);
    setModalError(null);
    try {
      const month = selectedMonthId;
      if (contentModalMode === "create") {
        if (contentType === "LESSON") {
          const created = await createLesson({
            type: "LESSON",
            title: data.title,
            description: data.description,
            month,
            image: data.image || undefined,
            videoUrl: data.videoUrl,
            writtenExplanation: data.writtenExplanation,
            homework: validQuestions,
          });
          // CreateLessonDto لا يقبل note، فنحفظه بتحديث لاحق بعد الإنشاء
          if (data.note.trim() && created?._id) {
            await updateContent(created._id, "LESSON", { note: data.note.trim() });
          }
        } else {
          await createExam({
            type: "EXAM",
            title: data.title,
            description: data.description,
            month,
            image: data.image || undefined,
            examQuestions: validQuestions,
            passPercentage: data.passPercentage,
          });
        }
      } else if (editingContent) {
        const payload: Record<string, unknown> = {
          title: data.title,
          description: data.description,
          image: data.image || undefined,
          order: editingContent.order,
        };
        if (editingContent.type === "LESSON") {
          payload.videoUrl = data.videoUrl || undefined;
          payload.writtenExplanation = data.writtenExplanation || undefined;
          payload.homework = validQuestions;
          payload.note = data.note || undefined;
        } else {
          payload.examQuestions = validQuestions;
          payload.passPercentage = data.passPercentage;
        }
        await updateContent(editingContent._id, editingContent.type, payload);
      }
      await loadContent(selectedMonthId);
      setContentModalOpen(false);
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء حفظ المحتوى");
    } finally {
      setSaving(false);
    }
  };

  // ============ Delete handler ============
  const requestDelete = (target: DeleteTarget) => {
    setDeleteTarget(target);
    setModalError(null);
    setConfirmOpen(true);
  };

  const closeStageModal = () => setStageModalOpen(false);
  const closeMonthModal = () => setMonthModalOpen(false);
  const closeContentModal = () => setContentModalOpen(false);

  const closeConfirm = () => {
    setConfirmOpen(false);
    setDeleteTarget(null);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    setModalError(null);
    try {
      if (deleteTarget.kind === "stage") {
        await deleteStage(deleteTarget.stage._id);
        setSelectedStageId(null);
        setStages([]);
        await loadStages();
      } else if (deleteTarget.kind === "month") {
        await deleteMonth(deleteTarget.month._id);
        if (selectedStageId) await loadMonths(selectedStageId);
      } else {
        await deleteContent(deleteTarget.content._id, deleteTarget.content.type);
        if (selectedMonthId) await loadContent(selectedMonthId);
      }
      closeConfirm();
    } catch (e) {
      setModalError(e instanceof Error ? e.message : "حدث خطأ أثناء الحذف");
    } finally {
      setDeleting(false);
    }
  };

  const deleteMessage = (() => {
    if (!deleteTarget) return "";
    if (deleteTarget.kind === "stage")
      return `سيتم حذف المرحلة "${deleteTarget.stage.title}" وجميع الأشهر والمحتوى المرتبط بها. لا يمكن التراجع عن هذا الإجراء.`;
    if (deleteTarget.kind === "month")
      return `سيتم حذف الشهر "${deleteTarget.month.title}" وجميع الدروس والاختبارات المرتبطة به. لا يمكن التراجع عن هذا الإجراء.`;
    return `سيتم حذف "${deleteTarget.content.title}" نهائياً. لا يمكن التراجع عن هذا الإجراء.`;
  })();

  return {
    error,
    loadingStages,
    loadingMonths,
    loadingContent,
    stages,
    months,
    content,
    selectedStageId,
    selectedMonthId,
    selectedStage,
    selectedMonth,
    selectStage,
    selectMonth,
    moveStage,
    moveMonth,
    moveContent,
    openStageCreate,
    openStageEdit,
    openMonthCreate,
    openMonthEdit,
    openExamCreate,
    openLessonCreate,
    openContentEdit,
    stageModalOpen,
    stageModalMode,
    editingStage,
    monthModalOpen,
    monthModalMode,
    editingMonth,
    contentModalOpen,
    contentModalMode,
    editingContent,
    contentType,
    setContentType,
    saving,
    modalError,
    handleStageSave,
    handleMonthSave,
    handleContentSave,
    handleDelete,
    requestDelete,
    closeConfirm,
    closeStageModal,
    closeMonthModal,
    closeContentModal,
    confirmOpen,
    deleting,
    deleteMessage,
  };
}