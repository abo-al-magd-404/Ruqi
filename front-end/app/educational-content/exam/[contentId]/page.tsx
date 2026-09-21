"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { ClipboardList, Timer, Trophy, PlayCircle } from "lucide-react";
import { getContentById } from "@/lib/educational-content/content";
import { getMonthContent } from "@/lib/educational-content/content";
import { getEducationalMonthById } from "@/lib/educational-content/months";
import type { ContentDetails, ContentItem, EducationalMonth } from "@/lib/types/educational-content";
import MonthDrawer, { MonthDrawerButton } from "@/app/educational-content/module/MonthDrawer";
import MonthSidebar from "@/app/educational-content/module/MonthSidebar";
import Loading from "@/app/loading";
import ContentBreadcrumb from "@/app/educational-content/module/ContentBreadcrumb";
import { getExamProgress } from "@/lib/progress";
import { getMonthProgress } from "@/lib/progress";
import type { ExamProgress, MonthProgress } from "@/lib/progress";
import { getSequenceLockedIds } from "@/lib/progress/sequence";
import { getProfile } from "@/lib/account/profile";

const EXAM_DURATION_MINUTES = 30;

export default function ExamOverviewPage({ params }: { params: Promise<{ contentId: string }> }) {
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [month, setMonth] = useState<EducationalMonth | null>(null);
  const [monthContentList, setMonthContentList] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [examProgress, setExamProgress] = useState<ExamProgress | null>(null);
  const [monthProgress, setMonthProgress] = useState<MonthProgress | null>(null);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchExamDetails = async () => {
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

        const progress = await getExamProgress(contentId).catch(() => null);
        if (!active) return;
        setExamProgress(progress);

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
            setMonthProgress(monthProgress);
          }
        }
      } catch {
        if (active) setContent(null);
      } finally {
        if (active) setIsLoading(false);
      }
    };

    if (contentId) fetchExamDetails();

    return () => {
      active = false;
    };
  }, [contentId]);

  if (isLoading) {
    return <Loading />;
  }

  if (isLocked) {
    return (
      <div
        className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo"
        dir="rtl"
      >
        <h3 className="font-extrabold text-[24px] text-text-main mb-3">هذا الاختبار غير متاح حالياً</h3>
        <p className="font-medium text-sm text-text-muted mb-6 text-center max-w-md">
          أكمل المحتوى السابق أولاً، ثم سيفتح لك هذا الاختبار لإتمام خطتك الدراسية.
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
        <h3 className="font-extrabold text-[24px] text-danger mb-3">عذراً، الاختبار غير متوفر</h3>
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

  const questionsCount = content.examQuestions?.length || 20;
  const attempted = !!examProgress && (examProgress.passed || examProgress.totalPoints > 0);

  const instructions = [
    "يرجى التأكد من استقرار اتصال الإنترنت قبل بدء الاختبار.",
    "بمجرد الضغط على زر (ابدأ الاختبار) سيبدأ المؤقت التنازلي مباشرة ولا يمكن إيقافه مؤقتاً.",
    "يسمح بتقديم الاختبار لمرة واحدة فقط لكل دورة دورية شهرية.",
    "يتم احتساب الدرجات وإرسال تقرير الأداء فور تسليم الاختبار.",
    "الالتزام بالوقت يسهم إيجاباً في ترتيبك العام على لوحة متفوقي منصة رُقِيّ.",
  ];

  return (
    <div
      className="w-full min-h-screen bg-background flex flex-col items-center pt-20 pb-20 lg:pt-24 lg:pb-14 px-4 md:px-8 lg:px-20 relative font-cairo"
      dir="rtl"
    >
      <main className="flex flex-col items-start gap-6 md:gap-8 w-full max-w-[1280px] flex-1">
        <ContentBreadcrumb />

        <div className="flex flex-col lg:flex-row items-start gap-8 md:gap-10 w-full mb-10">
          <div className="flex flex-col gap-6 md:gap-8 flex-1 w-full min-w-0">
            <div className="flex flex-col items-start gap-3 w-full">
              <span className="bg-warning-bg text-warning font-bold text-[12px] px-3.5 py-1.5 rounded-control border border-warning/30">
                اختبار تقويمي معتمد
              </span>
              <h1 className="font-extrabold text-[22px] sm:text-[24px] md:text-[28px] lg:text-[32px] text-text-main leading-tight">
                {content.title}
              </h1>
              <p className="font-medium text-[14px] md:text-[15px] text-text-muted leading-relaxed max-w-[700px]">
                {content.description ||
                  "اختبر مدى استيعابك لمقرر هذا الشهر من خلال هذا الاختبار التقويمي المعتمد والمصمم لقياس مستواك الدقيق."}
              </p>
            </div>

            {attempted && examProgress && (
              <div
                className={`w-full rounded-card border p-5 flex flex-wrap items-center gap-x-6 gap-y-3 ${
                  examProgress.passed
                    ? "bg-success-bg border-success/30"
                    : "bg-warning-bg border-warning/30"
                }`}
              >
                <span
                  className={`inline-flex items-center gap-2 font-extrabold text-[15px] ${
                    examProgress.passed ? "text-success" : "text-warning"
                  }`}
                >
                  <Trophy size={18} strokeWidth={2.5} />
                  {examProgress.passed ? "لقد نجحت في هذا الاختبار" : "لم تنجح بعد — يمكنك إعادة المحاولة"}
                </span>
                <span className="font-bold text-[13px] text-text-main">
                  أفضل نتيجة: {examProgress.correctAnswers} من {examProgress.totalQuestions}
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-[13px] text-primary ms-auto">
                  النقاط: {examProgress.totalPoints}
                  {examProgress.bonusPoints > 0 ? ` (+${examProgress.bonusPoints} مكافأة)` : ""}
                </span>
              </div>
            )}

            <div className="grid grid-cols-2  sm:grid-cols-3 gap-4 md:gap-6 w-full justify-between">
              <div className="bg-surface border border-border shadow-sm rounded-card p-6 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary-border">
                  <ClipboardList size={22} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[24px] md:text-[28px] text-text-main leading-none mt-1">
                  {questionsCount} سؤالاً
                </span>
                <span className="font-semibold text-[13px] sm:text-[14px] text-text-muted">عدد الأسئلة الكلية</span>
              </div>

              <div className="bg-surface border border-border shadow-sm rounded-card p-6 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary-border">
                  <Timer size={22} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[24px] md:text-[28px] text-text-main leading-none mt-1">
                  {EXAM_DURATION_MINUTES} دقيقة
                </span>
                <span className="font-semibold text-[13px] sm:text-[14px] text-text-muted">المدة المتاحة</span>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-surface border border-border shadow-sm rounded-card p-6 flex flex-col items-center text-center gap-2.5 transition-transform hover:-translate-y-1">
                <div className="w-12 h-12 rounded-full bg-primary-light flex items-center justify-center text-primary border border-primary-border">
                  <Trophy size={22} strokeWidth={2.5} />
                </div>
                <span className="font-black text-[24px] md:text-[28px] text-text-main leading-none mt-1">
                  {typeof content.passPercentage === "number" ? `${content.passPercentage}٪` : "٥٠٪"}
                </span>
                <span className="font-semibold  text-[13px] sm:text-[14px] text-text-muted">نسبة النجاح</span>
              </div>
            </div>

            <div className="bg-surface border border-border shadow-sm rounded-card p-5 sm:p-8 md:p-10 flex flex-col gap-6 w-full">
              <h3 className="font-extrabold text-[18px] sm:text-[20px] text-text-main border-b border-border pb-4">
                تعليمات وإرشادات الاختبار الهامّة
              </h3>

              <div className="flex flex-col gap-4">
                {instructions.map((instruction, idx) => (
                  <div key={idx} className="flex items-start gap-3.5">
                    <span className="w-6 h-6 rounded-full bg-primary-light text-primary font-bold text-[12px] flex items-center justify-center shrink-0 mt-0.5 border border-primary-border">
                      {idx + 1}
                    </span>
                    <p className="font-medium text-[14px] sm:text-[15px] text-text-main leading-relaxed">
                      {instruction}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-6 border-t border-border flex justify-end w-full mt-2">
                <Link
                  href={`/educational-content/exam/${contentId}/take`}
                  className="w-full sm:w-auto h-[52px] sm:h-[58px] px-8 sm:px-12 bg-primary hover:bg-primary-hover text-footer font-bold text-[15px] sm:text-[16px] rounded-xl shadow-[0_8px_16px_rgba(196,154,69,0.14)] transition-all flex items-center justify-center gap-2.5 active:scale-95"
                >
                  <PlayCircle size={20} strokeWidth={2.5} />
                  <span>{attempted ? "أعد المحاولة" : "ابدأ الاختبار الآن"}</span>
                </Link>
              </div>
            </div>
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
