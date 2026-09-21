"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ShieldAlert } from "lucide-react";
import { getMonthContent, getContentById } from "@/lib/educational-content/content";
import { getEducationalMonthById } from "@/lib/educational-content/months";
import type { ContentDetails, ContentItem, ContentQuestion, EducationalMonth } from "@/lib/types/educational-content";
import { submitHomework } from "@/lib/progress";
import { getMonthProgress } from "@/lib/progress";
import type { MonthProgress } from "@/lib/progress";
import { getSequenceLockedIds } from "@/lib/progress/sequence";
import { getProfile } from "@/lib/account/profile";
import MonthDrawer, { MonthDrawerButton } from "@/app/educational-content/module/MonthDrawer";
import MonthSidebar from "@/app/educational-content/module/MonthSidebar";
import ContentBreadcrumb from "@/app/educational-content/module/ContentBreadcrumb";

function isExactSet(chosen: number[], correct: number[]): boolean {
  if (chosen.length !== correct.length) return false;
  const set = new Set(correct);
  return chosen.every((c) => set.has(c));
}

export default function AssignmentPage({ params }: { params: Promise<{ contentId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [month, setMonth] = useState<EducationalMonth | null>(null);
  const [monthContentList, setMonthContentList] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState<Record<number, number[]>>({});
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [monthProgress, setMonthProgress] = useState<MonthProgress | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const contentData = await getContentById(contentId);
        const profile = await getProfile().catch(() => null);
        if (!active) return;
        setIsStudent(profile?.role === "STUDENT");
        setContent(contentData);

        if (contentData?.locked) {
          if (active) setIsLocked(true);
          return;
        }

        if (contentData && contentData.month) {
          const [monthContent, monthData] = await Promise.all([
            getMonthContent(contentData.month),
            getEducationalMonthById(contentData.month),
          ]);
          if (!active) return;

          setMonthContentList([...monthContent.items].sort((a, b) => a.order - b.order));
          setMonth(monthData);

          if (profile?.role === "STUDENT") {
            const monthProgress = await getMonthProgress(contentData.month).catch(() => null);
            if (!active) return;
            setMonthProgress(monthProgress);
            if (
              monthProgress &&
              getSequenceLockedIds(
                [...monthContent.items].sort((a, b) => a.order - b.order),
                monthProgress,
              ).has(String(contentId))
            ) {
              setIsLocked(true);
              return;
            }
          }
        }
      } catch {
        if (active) setContent(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (contentId) fetchData();

    return () => {
      active = false;
    };
  }, [contentId]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center w-full min-h-screen bg-background">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo"
        dir="rtl"
      >
        <h3 className="font-extrabold text-[24px] text-text-main mb-3">هذا الواجب غير متاح حالياً</h3>
        <p className="font-medium text-sm text-text-muted mb-6 text-center max-w-md">
          أكمل الدروس السابقة أولاً، ثم سيفتح لك هذا الواجب التطبيقي إتماماً لخطتك الدراسية.
        </p>
        <Link
          href={content?.month ? `/educational-content/month/${content.month}` : "/educational-content"}
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة إلى المحتوى
        </Link>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 mt-3 bg-transparent border border-border rounded-control text-text-muted font-bold text-[15px] hover:bg-surface-secondary transition-colors flex items-center justify-center"
        >
          تصفح المراحل التعليمية
        </Link>
      </div>
    );
  }

  if (!content) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo"
        dir="rtl"
      >
        <h3 className="font-extrabold text-[24px] text-danger mb-3">عذراً، الواجب غير متوفر</h3>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-[15px] hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const currentIndex = monthContentList.findIndex((item) => item._id === content._id);
  const drawerLockedIds = isStudent ? getSequenceLockedIds(monthContentList, monthProgress) : new Set<string>();
  const contentPosition = currentIndex === -1 ? content.order : currentIndex + 1;
  const totalItems = monthContentList.length || 1;

  const questions: ContentQuestion[] = content.homework || [];
  const currentQuestion = questions[currentQuestionIndex];
  const totalQuestions = questions.length || 1;
  const progressPercentage = Math.round(((currentQuestionIndex + 1) / totalQuestions) * 100);

  const handleOptionSelect = (optionIndex: number) => {
    setSelectedOptions((prev) => {
      const current = prev[currentQuestionIndex] ?? [];
      const next = current.includes(optionIndex)
        ? current.filter((o) => o !== optionIndex)
        : [...current, optionIndex];
      return { ...prev, [currentQuestionIndex]: next };
    });
  };

  const handleSubmit = async () => {
    if (submitting) return;
    const total = questions.length;
    const answers = questions.map((_, idx) => {
      const chosen = selectedOptions[idx] ?? [];
      return [...chosen].sort((a, b) => a - b);
    });

    let correct = 0;
    if (total > 0) {
      questions.forEach((q, idx) => {
        if (answers[idx].length > 0 && isExactSet(answers[idx], q.correctAnswers)) {
          correct += 1;
        }
      });
    }

    setSubmitting(true);
    setSubmitError(null);
    try {
      const result = await submitHomework(contentId, answers);
      correct = result.correctAnswers;
    } catch (error) {
      const apiError = error as { status?: number };
      if (apiError.status === 401 || apiError.status === 403) {
        // غير مصرح للمعلم/الزائر — نحسب محليًا للعرض فقط (معاينة)
      } else {
        setSubmitError(error instanceof Error ? error.message : "تعذر تسليم الواجب، حاول مجدداً");
        setSubmitting(false);
        return;
      }
    } finally {
      setSubmitting(false);
    }

    const scorePct = total === 0 ? 0 : Math.round((correct / total) * 100);
    try {
      localStorage.setItem(`ruqi_answers_${contentId}`, JSON.stringify(selectedOptions));
    } catch {}
    router.push(
      `/educational-content/content/${contentId}/assignment/result?score=${scorePct}&correct=${correct}&total=${total}`,
    );
  };

  return (
    <div
      className="w-full min-h-screen bg-background flex flex-col items-center pt-20 pb-20 lg:pt-24 lg:pb-14 px-4 md:px-8 lg:px-20 relative font-cairo"
      dir="rtl"
    >
      <main className="flex flex-col items-start gap-6 md:gap-8 w-full max-w-[1280px] flex-1">
        <ContentBreadcrumb />

        <div className="flex flex-col lg:flex-row items-start gap-8 md:gap-10 w-full mb-10">
          <div className="flex flex-col items-start gap-6 md:gap-8 flex-1 w-full min-w-0">
            <h1 className="font-extrabold text-[22px] sm:text-[24px] md:text-[28px] lg:text-[32px] text-text-main leading-tight w-full">
              واجب — {content.title}
            </h1>

            <div className="w-full bg-surface border border-border shadow-sm rounded-card p-5 sm:p-8 md:p-10 flex flex-col gap-6 md:gap-8">
              <div className="flex flex-col gap-4 w-full">
                <div className="flex justify-between items-center w-full flex-wrap gap-2">
                  <span className="font-bold text-[13px] sm:text-[14px] text-primary">
                    التقدم: {progressPercentage}٪ ({currentQuestionIndex + 1} من {totalQuestions})
                  </span>
                  <span className="font-extrabold text-[15px] sm:text-[16px] text-text-main">
                    السؤال {currentQuestionIndex + 1} من {totalQuestions}
                  </span>
                </div>
                <div className="w-full h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>

              {currentQuestion ? (
                <div className="flex flex-col gap-6 md:gap-8 w-full">
                  <h2 className="font-bold text-[16px] sm:text-[18px] md:text-[20px] text-text-main leading-relaxed w-full break-words">
                    {currentQuestion.questionText}
                  </h2>

                  {currentQuestion.correctAnswers.length > 1 && (
                    <span className="self-start text-[12px] sm:text-[13px] font-semibold text-primary bg-primary/10 border border-primary/30 rounded-lg px-3 py-1.5">
                      يمكن اختيار أكثر من إجابة لهذا السؤال
                    </span>
                  )}

                  <div className="flex flex-col gap-3 md:gap-4 w-full">
                    {currentQuestion.options.map((option, optIdx) => {
                      const isSelected = (selectedOptions[currentQuestionIndex] ?? []).includes(optIdx);
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleOptionSelect(optIdx)}
                          className={`flex items-start sm:items-center justify-between w-full min-h-[56px] sm:min-h-[64px] p-4 sm:px-[18px] rounded-xl transition-all duration-200 text-right border-[1.5px] ${
                            isSelected
                              ? "bg-primary-light border-primary shadow-[0_4px_12px_rgba(196,154,69,0.07)]"
                              : "bg-surface border-border hover:border-primary/40"
                          }`}
                        >
                          <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                            <div
                              className={`w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] rounded-[6px] flex items-center justify-center shrink-0 border-2 transition-colors mt-0.5 sm:mt-0 ${
                                isSelected ? "border-primary bg-primary" : "border-border bg-transparent"
                              }`}
                            >
                              {isSelected && <Check size={16} className="text-surface" strokeWidth={3} />}
                            </div>
                            <span
                              className={`font-medium text-[14px] sm:text-[15px] leading-relaxed break-words flex-1 text-right ${isSelected ? "text-primary-hover" : "text-text-main"}`}
                            >
                              {option}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-10 text-text-muted font-bold text-[14px] sm:text-[15px]">
                  لا توجد أسئلة مضافة لهذا الواجب بعد.
                </div>
              )}

              {submitError && (
                <p className="text-[13px] text-danger bg-danger-bg border border-danger rounded-lg p-3 text-center font-medium">
                  {submitError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 pt-4 sm:pt-2 w-full border-t border-border mt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (currentQuestionIndex > 0) setCurrentQuestionIndex((p) => p - 1);
                  }}
                  disabled={currentQuestionIndex === 0}
                  className="order-2 sm:order-1 w-full sm:w-auto flex justify-center items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl font-bold text-[14px] sm:text-[15px] text-text-muted border border-border bg-transparent hover:bg-surface-secondary disabled:opacity-40 transition-all"
                >
                  <span className="mt-0.5">&lt;</span>
                  <span>السابق</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    if (currentQuestionIndex < questions.length - 1) {
                      setCurrentQuestionIndex((p) => p + 1);
                    } else {
                      handleSubmit();
                    }
                  }}
                  disabled={submitting}
                  className="order-1 sm:order-2 w-full sm:w-auto flex justify-center items-center gap-2 px-6 md:px-8 py-3.5 rounded-xl font-bold text-[14px] sm:text-[15px] text-footer bg-primary hover:bg-primary-hover disabled:opacity-50 shadow-[0_8px_16px_rgba(196,154,69,0.14)] transition-all"
                >
                  <span>
                    {submitting
                      ? "جاري التسليم..."
                      : currentQuestionIndex >= questions.length - 1
                        ? "تسليم الواجب"
                        : "السؤال التالي"}
                  </span>
                  <span className="mt-0.5">&gt;</span>
                </button>
              </div>
            </div>

            <div className="w-full flex flex-row items-start gap-4 p-4 sm:p-5 bg-warning-bg border border-warning/30 rounded-card">
              <div className="w-10 h-10 rounded-full bg-surface flex items-center justify-center shrink-0">
                <ShieldAlert size={18} className="text-warning" />
              </div>
              <div className="flex flex-col gap-1 flex-1 min-w-0">
                <h4 className="font-bold text-[14px] sm:text-[15px] text-warning">مطلوب مذاكرته من الكتاب</h4>
                <p className="font-medium text-[12px] sm:text-[13px] text-warning leading-relaxed break-words">
                  يرجى مراجعة المقرر المطبوع أو صفحات الكتاب المدرسي للتمكن من فهم أحكام وقواعد الدرس بشكل صحيح قبل
                  استكمال الواجب.
                </p>
              </div>
            </div>

            <Link
              href={`/educational-content/content/${contentId}`}
              className="w-full h-[52px] bg-surface hover:bg-primary-light border border-border text-text-main font-bold text-[14px] sm:text-[15px] rounded-xl transition-colors flex items-center justify-center"
            >
              العودة إلى الدرس
            </Link>
          </div>

          <MonthSidebar
            title={month ? `محتويات ${month.title}` : "محتويات الشهر"}
            contentList={monthContentList}
            currentContentId={content._id}
            currentIndex={currentIndex}
            contentPosition={contentPosition}
            totalItems={totalItems}
            lockedIds={drawerLockedIds}
          />
        </div>
      </main>

      <MonthDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title={month ? `محتويات ${month.title}` : "محتويات الشهر"}
        contentList={monthContentList}
        currentContentId={content._id}
        currentIndex={currentIndex}
        contentPosition={contentPosition}
        totalItems={totalItems}
        lockedIds={drawerLockedIds}
      />
      <MonthDrawerButton onClick={() => setDrawerOpen(true)} />
    </div>
  );
}
