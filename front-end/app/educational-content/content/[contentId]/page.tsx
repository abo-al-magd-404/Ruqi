"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Play, Check, Circle, ChevronDown, ChevronUp } from "lucide-react";
import { getContentById } from "@/lib/educational-content/content";
import { getMonthContent } from "@/lib/educational-content/content";
import { getEducationalMonthById } from "@/lib/educational-content/months";
import type { ContentDetails, ContentItem, EducationalMonth } from "@/lib/types/educational-content";
import { getLessonProgress, updateLessonProgress } from "@/lib/progress";
import { getMonthProgress } from "@/lib/progress";
import type { LessonProgress, MonthProgress } from "@/lib/progress";
import { getSequenceLockedIds } from "@/lib/progress/sequence";
import { getProfile } from "@/lib/account/profile";
import { toEmbedVideoUrl } from "@/lib/educational-content/video";
import MonthDrawer, { MonthDrawerButton } from "@/app/educational-content/module/MonthDrawer";
import MonthSidebar from "@/app/educational-content/module/MonthSidebar";
import Loading from "@/app/loading";
import ContentBreadcrumb from "@/app/educational-content/module/ContentBreadcrumb";

export default function ContentDetailsPage({ params }: { params: Promise<{ contentId: string }> }) {
  const router = useRouter();
  const resolvedParams = use(params);
  const contentId = resolvedParams.contentId;

  const [content, setContent] = useState<ContentDetails | null>(null);
  const [month, setMonth] = useState<EducationalMonth | null>(null);
  const [monthContentList, setMonthContentList] = useState<ContentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [step, setStep] = useState<"video" | "explanation" | "book">("video");
  const [lessonProgress, setLessonProgress] = useState<LessonProgress | null>(null);
  const [monthProgress, setMonthProgress] = useState<MonthProgress | null>(null);
  const [isStudent, setIsStudent] = useState(false);

  useEffect(() => {
    let active = true;

    const fetchDetails = async () => {
      try {
        const contentData = await getContentById(contentId);
        const profile = await getProfile().catch(() => null);
        if (!active) return;
        setIsStudent(profile?.role === "STUDENT");

        if (contentData && contentData.type === "EXAM") {
          router.replace(`/educational-content/exam/${contentId}`);
          return;
        }

        if (contentData?.locked) {
          if (active) setIsLocked(true);
          return;
        }

        setContent(contentData);

        const progress = await getLessonProgress(contentId).catch(() => null);
        if (!active) return;
        setLessonProgress(progress);

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
        if (active) {
          setContent(null);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (contentId) fetchDetails();

    return () => {
      active = false;
    };
  }, [contentId, router]);

  useEffect(() => {
    if (!content?.videoUrl) return;
    const embedUrl = toEmbedVideoUrl(content.videoUrl);
    if (!embedUrl) return;

    const handleMessage = async (event: MessageEvent) => {
      if (
        event.origin !== "https://www.youtube.com" &&
        event.origin !== "https://www.youtube-nocookie.com"
      ) {
        return;
      }
      let data: { event?: string; info?: number };
      try {
        data = JSON.parse(String(event.data));
      } catch {
        return;
      }
      if (data.event === "onStateChange" && data.info === 0) {
        try {
          const updated = await updateLessonProgress(contentId, "video");
          setLessonProgress(updated);
        } catch {
          // غير مصرح أو تعذر الاتصال
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [content, contentId]);

  if (isLoading) {
    return <Loading />;
  }

  if (isLocked) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo" dir="rtl">
        <h3 className="font-extrabold text-2xl text-text-main mb-3">هذا الدرس غير متاح حالياً</h3>
        <p className="font-medium text-sm text-text-muted mb-6 text-center max-w-md">
          أكمل المحتوى السابق أولاً، ثم سيفتح لك هذا الدرس لإتمام خطتك الدراسية.
        </p>
        <Link
          href={content?.month ? `/educational-content/month/${content.month}` : "/educational-content"}
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-base hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة إلى المحتوى
        </Link>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 mt-3 bg-transparent border border-border rounded-control text-text-muted font-bold text-base hover:bg-surface-secondary transition-colors flex items-center justify-center"
        >
          تصفح المراحل التعليمية
        </Link>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center w-full min-h-screen bg-background px-4 font-cairo" dir="rtl">
        <h3 className="font-extrabold text-2xl text-danger mb-3">عذراً، المحتوى غير متوفر</h3>
        <Link
          href="/educational-content"
          className="h-[48px] px-8 bg-primary rounded-control text-surface font-bold text-base hover:bg-primary-hover transition-colors flex items-center justify-center"
        >
          العودة للمراحل التعليمية
        </Link>
      </div>
    );
  }

  const currentIndex = monthContentList.findIndex((item) => item._id === content._id);
  const contentPosition = currentIndex === -1 ? content.order : currentIndex + 1;
  const totalItems = monthContentList.length || 1;
  const nextItem =
    currentIndex < monthContentList.length - 1 && currentIndex !== -1 ? monthContentList[currentIndex + 1] : null;

  const articleText = content.writtenExplanation || content.description || "";
  const embedVideoUrl = content.videoUrl ? toEmbedVideoUrl(content.videoUrl) : null;
  const drawerLockedIds = isStudent ? getSequenceLockedIds(monthContentList, monthProgress) : new Set<string>();
  const currentLessonStages = isStudent
    ? {
        video: !content.videoUrl || lessonProgress?.videoCompleted === true,
        explanation: !content.writtenExplanation || lessonProgress?.explanationCompleted === true,
        book: !content.note || lessonProgress?.bookCompleted === true,
        training:
          !content.homework || content.homework.length === 0 || lessonProgress?.homeworkCompleted === true,
      }
    : null;

  const markStep = async (type: "video" | "explanation" | "book") => {
    try {
      const updated = await updateLessonProgress(contentId, type);
      setLessonProgress(updated);
    } catch {
      // غير مصرح للمعلم/الزائر أو تعذر الاتصال
    }
  };

  const handleNextAction = () => {
    setDrawerOpen(false);
    if (content.homework && content.homework.length > 0) {
      router.push(`/educational-content/content/${contentId}/assignment`);
    } else if (nextItem) {
      router.push(
        nextItem.type === "EXAM"
          ? `/educational-content/exam/${nextItem._id}`
          : `/educational-content/content/${nextItem._id}`,
      );
    } else {
      router.push("/educational-content");
    }
  };

  return (
    <div className="w-full min-h-screen bg-background flex flex-col items-center pt-20 pb-20 lg:pt-24 lg:pb-14 px-4 md:px-20 relative font-cairo" dir="rtl">
      <main className="flex flex-col items-start gap-8 w-full max-w-[1280px] flex-1">
        <ContentBreadcrumb />

        <div className="flex flex-col lg:flex-row items-start gap-10 w-full mb-10">
          
          <div className="flex flex-col items-start gap-6 flex-1 w-full min-w-0">
            
            <h1 className="font-extrabold text-[24px] md:text-[28px] lg:text-[32px] text-text-main leading-tight w-full">
              {content.title}
            </h1>

            {lessonProgress && (
              <div className="w-full bg-surface border border-border rounded-card p-4 flex flex-wrap items-center gap-3">
                <span className="font-bold text-[13px] text-text-main">حالة الدرس:</span>
                {[
                  { label: "الفيديو", done: lessonProgress.videoCompleted },
                  ...(articleText
                    ? [{ label: "الشرح", done: lessonProgress.explanationCompleted }]
                    : []),
                  ...(content.note ? [{ label: "الكتاب", done: lessonProgress.bookCompleted }] : []),
                  ...(content.homework && content.homework.length > 0
                    ? [{ label: "التدريب", done: lessonProgress.homeworkCompleted }]
                    : [])
                ].map((s) => (
                  <span
                    key={s.label}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-control text-[12px] font-bold border ${
                      s.done
                        ? "bg-success-bg text-success border-success/30"
                        : "bg-background text-text-muted border-border"
                    }`}
                  >
                    {s.done ? <Check size={13} strokeWidth={3} /> : <Circle size={8} fill="currentColor" />}
                    {s.label}
                  </span>
                ))}
                <span className="ms-auto inline-flex items-center gap-1.5 px-3 py-1 rounded-control text-[12px] font-bold bg-primary-light text-primary border border-primary-border">
                  نقاط الدرس: {lessonProgress.totalPoints}
                </span>
              </div>
            )}

            {step === "video" &&
              (content.videoUrl ? (
                <div className="w-full aspect-video bg-footer rounded-card shadow-[0_16px_48px_-4px_rgba(84,70,58,0.12)] overflow-hidden flex items-center justify-center relative">
                  {embedVideoUrl ? (
                    <iframe
                      key={embedVideoUrl}
                      src={embedVideoUrl}
                      title={content.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      className="w-full h-full border-0"
                    />
                  ) : (
                    <video
                      key={content.videoUrl}
                      src={content.videoUrl}
                      controls
                      onEnded={() => markStep("video")}
                      className="w-full h-full object-cover"
                    />
                  )}
                </div>
              ) : (
                <div className="w-full aspect-video bg-footer rounded-card shadow-[0_16px_48px_-4px_rgba(84,70,58,0.12)] overflow-hidden flex flex-col items-center justify-center relative border border-border">
                  <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center shadow-[0_8px_24px_rgba(196,154,69,0.25)] mb-4">
                    <Play size={32} className="text-footer ml-1" fill="currentColor" />
                  </div>
                  <span className="text-primary font-bold text-[16px]">الفيديو غير متوفر حالياً</span>
                </div>
              ))}

            {step === "video" && content.videoUrl && !embedVideoUrl && (
              <span className="text-[12px] font-medium text-text-muted -mt-2">
                شغّل الفيديو حتى النهاية لتسجيل إتمام المشاهدة
              </span>
            )}

            {step === "video" && content.videoUrl && (
              <button
                type="button"
                onClick={() => markStep("video")}
                className={`w-full h-[48px] ${
                  lessonProgress?.videoCompleted
                    ? "bg-success-bg border border-success/40 text-success"
                    : "bg-surface border border-primary text-primary hover:bg-primary-light"
                } font-bold text-[15px] rounded-control transition-colors flex items-center justify-center gap-2 mt-1`}
              >
                {lessonProgress?.videoCompleted ? (
                  <span className="inline-flex items-center gap-1.5">
                    <Check size={17} strokeWidth={3} />
                    تمت المشاهدة
                  </span>
                ) : (
                  "أتممت مشاهدة الفيديو"
                )}
              </button>
            )}

            {step === "explanation" || step === "book" ? (
              <button
                type="button"
                onClick={() => setStep(step === "book" ? "explanation" : "video")}
                className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-primary hover:text-primary-hover transition-colors"
              >
                <ChevronUp size={16} strokeWidth={2.5} />
                {step === "book" ? "العودة إلى الشرح التفصيلي" : "العودة لمشاهدة الفيديو"}
              </button>
            ) : null}

            {step === "video" && articleText && (
              <button
                type="button"
                onClick={() => {
                  setStep("explanation");
                  markStep("explanation");
                  requestAnimationFrame(() => {
                    document
                      .getElementById("explanation-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
                className="w-full h-[58px] bg-surface border border-primary text-primary font-bold text-[16px] rounded-control transition-colors flex items-center justify-center gap-2 hover:bg-primary-light mt-2"
              >
                <span>الانتقال إلى الشرح التفصيلي</span>
                <ChevronDown size={20} strokeWidth={2.5} />
              </button>
            )}

            {step === "video" && !articleText && content.note && (
              <button
                type="button"
                onClick={() => setStep("book")}
                className="w-full h-[58px] bg-surface border border-primary text-primary font-bold text-[16px] rounded-control transition-colors flex items-center justify-center gap-2 hover:bg-primary-light mt-2"
              >
                <span>الانتقال إلى الكتاب المطلوب</span>
                <ChevronDown size={20} strokeWidth={2.5} />
              </button>
            )}

            {step === "explanation" && articleText && (
              <div
                id="explanation-section"
                className="w-full bg-surface border border-border shadow-sm rounded-card p-6 md:p-8 flex flex-col gap-4 mt-2 scroll-mt-32"
              >
                <h3 className="font-bold text-[18px] text-primary flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-primary rounded-full"></span>
                  الشرح التفصيلي
                  {lessonProgress?.explanationCompleted && (
                    <Check size={16} strokeWidth={3} className="text-success" />
                  )}
                </h3>
                <p className="font-medium text-[15px] text-text-muted leading-[32px] w-full whitespace-pre-wrap break-words">
                  {articleText}
                </p>
              </div>
            )}

            {step === "explanation" && content.note && (
              <button
                type="button"
                onClick={() => {
                  setStep("book");
                  markStep("book");
                  requestAnimationFrame(() => {
                    document
                      .getElementById("book-section")
                      ?.scrollIntoView({ behavior: "smooth", block: "start" });
                  });
                }}
                className="w-full h-[58px] bg-surface border border-warning text-warning font-bold text-[16px] rounded-control transition-colors flex items-center justify-center gap-2 hover:bg-warning-bg mt-2"
              >
                <span>الانتقال إلى الكتاب المطلوب</span>
                <ChevronDown size={20} strokeWidth={2.5} />
              </button>
            )}

            {step === "book" && content.note && (
              <div
                id="book-section"
                className="w-full bg-warning-bg border border-warning/30 rounded-card p-6 md:p-8 flex flex-col gap-4 mt-2 scroll-mt-32"
              >
                <h3 className="font-bold text-[18px] text-warning flex items-center gap-2">
                  <span className="w-1.5 h-6 bg-warning rounded-full"></span>
                  الكتاب المطلوب
                </h3>
                <p className="font-medium text-[15px] text-warning leading-[32px] w-full whitespace-pre-wrap break-words">
                  {content.note}
                </p>
                <button
                  type="button"
                  onClick={() => markStep("book")}
                  disabled={lessonProgress?.bookCompleted === true}
                  className={`self-start h-[46px] px-6 font-bold text-[14px] rounded-control transition-opacity ${
                    lessonProgress?.bookCompleted
                      ? "bg-success text-white cursor-default"
                      : "bg-warning text-white hover:opacity-90"
                  }`}
                >
                  {lessonProgress?.bookCompleted ? "تم إنهاء الكتاب ✓" : "أنهيت الكتاب"}
                </button>
              </div>
            )}

            {(step === "book" ||
              (step === "explanation" && !content.note) ||
              (!articleText && !content.note)) && (
              <button
                type="button"
                onClick={handleNextAction}
                className="w-full h-[58px] bg-primary hover:bg-primary-hover text-footer font-bold text-[16px] rounded-control shadow-[0_12px_32px_rgba(196,154,69,0.1)] transition-colors flex items-center justify-center gap-2 mt-4"
              >
                <span>
                  {content.homework && content.homework.length > 0
                    ? "الانتقال إلى التدريب والتطبيقات"
                    : "تمت مشاهدة الدرس المصور والانتقال للتالي"}
                </span>
                <Check size={20} strokeWidth={2.5} />
              </button>
            )}
            
          </div>

          <MonthSidebar
            title={month ? `محتويات ${month.title}` : "محتويات الشهر"}
            contentList={monthContentList}
            currentContentId={content._id}
            currentIndex={currentIndex}
            contentPosition={contentPosition}
            totalItems={totalItems}
            lockedIds={drawerLockedIds}
            currentLessonStages={currentLessonStages}
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
        currentLessonStages={currentLessonStages}
      />
      <MonthDrawerButton onClick={() => setDrawerOpen(true)} />
    </div>
  );
}