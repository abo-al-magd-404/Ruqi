"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { Lock, Sparkles, Check } from "lucide-react";
import { getEducationalMonthById } from "@/lib/educational-content/months";
import {
  getMonthContent,
  getContentById,
} from "@/lib/educational-content/content";
import { getEducationalStageById } from "@/lib/educational-content/stages";
import type {
  EducationalMonth,
  ContentItem,
  EducationalStage,
  ContentDetails,
} from "@/lib/types/educational-content";
import { getMonthProgress } from "@/lib/progress";
import { getSequenceLockedIds } from "@/lib/progress/sequence";
import type { MonthProgress } from "@/lib/types/progress";
import { getProfile } from "@/lib/account/profile";
import ContentBreadcrumb from "@/app/educational-content/module/ContentBreadcrumb";

export default function MonthContentPage({
  params,
}: {
  params: Promise<{ monthId: string }>;
}) {
  const resolvedParams = use(params);
  const monthId = resolvedParams.monthId;

  const [monthDetails, setMonthDetails] = useState<EducationalMonth | null>(
    null,
  );
  const [, setStageDetails] = useState<EducationalStage | null>(null);
  const [contentList, setContentList] = useState<ContentItem[]>([]);
  const [detailsMap, setDetailsMap] = useState<Record<string, ContentDetails>>(
    {},
  );
  const [monthProgress, setMonthProgress] = useState<MonthProgress | null>(
    null,
  );
  const [isStudent, setIsStudent] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchData = async () => {
      try {
        const [monthData, contentResp, profile] = await Promise.all([
          getEducationalMonthById(monthId),
          getMonthContent(monthId),
          getProfile().catch(() => null),
        ]);

        const sortedContent = [...contentResp.items].sort(
          (a, b) => a.order - b.order,
        );
        const isPrivileged =
          profile?.role === "TEACHER" || profile?.role === "ADMIN";
        const userSubscribed =
          isPrivileged ||
          profile?.subscribedMonths?.some(
            (id) => String(id) === String(monthId),
          ) === true;
        const locked =
          contentResp.locked === true ||
          monthData?.locked === true ||
          sortedContent.some((item) => item.locked === true) ||
          !userSubscribed;
        setMonthDetails({ ...monthData, locked });
        setContentList(sortedContent);
        setLoadError(null);

        if (profile?.role === "STUDENT") {
          const openProgress = await getMonthProgress(monthId).catch(
            () => null,
          );
          if (active) setMonthProgress(openProgress);
        }
        if (active) setIsStudent(profile?.role === "STUDENT");

        if (monthData && monthData.stage) {
          try {
            const stageData = await getEducationalStageById(monthData.stage);
            if (active) setStageDetails(stageData);
          } catch {}
        }

        const detailResults = await Promise.all(
          sortedContent.map((item) =>
            getContentById(item._id).catch(() => null),
          ),
        );
        if (active) {
          const map: Record<string, ContentDetails> = {};
          detailResults.forEach((detail, idx) => {
            const item = sortedContent[idx];
            if (detail && item) map[item._id] = detail;
          });
          setDetailsMap(map);
        }
      } catch {
        if (active) {
          setLoadError("تعذر تحميل بيانات هذا الشهر.");
          setContentList([]);
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    if (monthId) fetchData();

    return () => {
      active = false;
    };
  }, [monthId]);

  const hasContent = contentList.length > 0;
  const monthIsLocked =
    monthDetails?.locked === true ||
    contentList.some((item) => item.locked === true);

  const sequenceLockedIds = isStudent
    ? getSequenceLockedIds(contentList, monthProgress)
    : new Set<string>();

  const completedIds = new Set<string>();
  monthProgress?.lessons.forEach((entry) => {
    if (entry.completed) completedIds.add(String(entry.lesson));
  });
  monthProgress?.exams.forEach((entry) => {
    if (entry.passed) completedIds.add(String(entry.exam));
  });

  const totalCount = monthProgress
    ? monthProgress.summary.totalLessons + monthProgress.summary.totalExams
    : contentList.length;
  const completedCount = monthProgress
    ? monthProgress.summary.completedLessons +
      monthProgress.summary.completedExams
    : 0;
  const progressPercentage =
    totalCount === 0 ? 0 : Math.round((completedCount / totalCount) * 100);
  const remainingLessons = monthProgress
    ? Math.max(
        0,
        monthProgress.summary.totalLessons -
          monthProgress.summary.completedLessons,
      )
    : contentList.filter((item) => item.type === "LESSON").length;
  const remainingExams = monthProgress
    ? Math.max(
        0,
        monthProgress.summary.totalExams - monthProgress.summary.completedExams,
      )
    : contentList.filter((item) => item.type === "EXAM").length;
  const remainingText = `متبقي ${remainingLessons} ${remainingLessons === 1 ? "درس" : remainingLessons === 2 ? "درسين" : "دروس"}${remainingExams > 0 ? ` و${remainingExams === 1 ? "اختبار واحد" : `${remainingExams} اختبارات`}` : ""} لإتمام المنهج`;

  return (
    <div
      className="w-full min-h-screen bg-background flex flex-col items-center overflow-x-hidden pt-20 pb-20 lg:pt-24 lg:pb-14 px-4 md:px-8"
      dir="rtl"
    >
      <main className="flex flex-col items-start gap-6 md:gap-10 w-full max-w-300">
        <ContentBreadcrumb />

        <section className="w-full bg-surface border border-border shadow-[0_8px_24px_-2px_rgba(84,70,58,0.06)] rounded-card overflow-hidden">
          <div className="flex flex-col lg:flex-row items-stretch justify-between p-6 md:p-10 gap-8">
            <div className="flex-1 flex flex-col items-start gap-4 order-1 lg:order-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="bg-primary-light text-primary font-bold text-xs px-3 py-1 rounded-control border border-primary-border inline-flex items-center gap-1.5">
                  <Sparkles size={13} />
                  الشهر الدراسي الأول
                </span>
                {typeof monthDetails?.price === "number" &&
                  monthDetails.price > 0 && (
                    <span className="bg-background border border-border text-text-muted font-bold text-xs px-3.5 py-1.5 rounded-control">
                      {monthDetails.price} ج.م
                    </span>
                  )}
                {monthIsLocked ? (
                  <span className="inline-flex items-center gap-1.5 bg-danger-bg text-danger font-bold text-xs px-3 py-1.5 rounded-control">
                    <Lock size={13} />
                    غير مشترك
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 bg-success-bg text-success font-bold text-xs px-3 py-1.5 rounded-control">
                    <Check size={13} />
                    مشترك
                  </span>
                )}
              </div>

              <h1 className="font-extrabold text-2xl md:text-3xl lg:text-[32px] text-text-main leading-tight">
                {monthDetails?.title}
              </h1>

              <p className="font-medium text-sm md:text-[15px] text-text-muted leading-relaxed text-right">
                {monthDetails?.description}
              </p>
            </div>

            <div className="w-full lg:w-[320px] flex flex-col justify-center gap-3 p-5 md:p-6 order-2 lg:order-2 shrink-0">
              <div className="flex justify-between items-center w-full">
                <span className="font-bold text-sm text-text-main">
                  {progressPercentage}٪ مكتمل
                </span>
                <span className="font-bold text-sm text-primary">
                  نسبة إنجاز الشهر
                </span>
              </div>
              <div
                className="w-full h-2 bg-primary-light rounded-full overflow-hidden"
                dir="ltr"
              >
                <div
                  className="h-full bg-primary transition-all duration-500 "
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              <span className="text-xs text-text-muted" dir="ltr">
                {remainingText}
              </span>
            </div>
          </div>
        </section>

        <section className="flex flex-col gap-5 w-full">
          <h2 className="font-extrabold text-xl md:text-2xl text-text-main">
            المحتوى المتتابع {monthDetails ? `[${monthDetails.title}]` : ""}
          </h2>

          {isLoading ? (
            <div className="flex justify-center items-center w-full py-20">
              <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : hasContent ? (
            <div className="flex flex-col gap-4 w-full">
              {contentList.map((item, index) => {
                const isLesson = item.type === "LESSON";
                const itemCompleted = completedIds.has(String(item._id));
                const sequenceLocked = sequenceLockedIds.has(String(item._id));
                const itemLocked =
                  monthIsLocked || item.locked === true || sequenceLocked;
                const href = isLesson
                  ? `/educational-content/content/${item._id}`
                  : `/educational-content/exam/${item._id}`;

                const row = (
                  <div
                    className={`flex flex-col sm:flex-row items-start sm:items-center justify-between p-5 md:p-6 bg-surface rounded-card shadow-sm border border-border gap-4 ${
                      itemLocked
                        ? "opacity-75"
                        : "group-hover:border-primary group-hover:shadow-md transition-all duration-300"
                    }`}
                  >
                    <div className="flex items-center gap-4 grow w-full sm:w-auto">
                      <span
                        className={`font-black text-2xl ${
                          itemLocked
                            ? "text-text-muted"
                            : "text-primary opacity-60"
                        }`}
                      >
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <div className="flex flex-col gap-2 grow min-w-0 text-right">
                        <h3
                          className={`font-extrabold text-base md:text-lg ${
                            itemLocked
                              ? "text-text-muted"
                              : "text-text-main group-hover:text-primary transition-colors"
                          }`}
                        >
                          {item.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="text-xs font-medium px-2.5 py-1 bg-background border border-border rounded-control text-text-muted">
                            {item.type === "EXAM" ? "اختبار" : "درس"}
                          </span>
                          {detailsMap[item._id]?.videoUrl && (
                            <span className="text-xs font-medium px-2.5 py-1 bg-background border border-border rounded-control text-text-muted">
                              فيديو
                            </span>
                          )}
                          {detailsMap[item._id]?.writtenExplanation && (
                            <span className="text-xs font-medium px-2.5 py-1 bg-background border border-border rounded-control text-text-muted">
                              شرح تفصيلي
                            </span>
                          )}
                          {(detailsMap[item._id]?.homework?.length || 0) >
                            0 && (
                            <span className="text-xs font-medium px-2.5 py-1 bg-background border border-border rounded-control text-text-muted">
                              واجب تطبيقي
                            </span>
                          )}
                          {(detailsMap[item._id]?.examQuestions?.length || 0) >
                            0 && (
                            <span className="text-xs font-medium px-2.5 py-1 bg-background border border-border rounded-control text-text-muted">
                              أسئلة تقييمية
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 sm:order-last">
                      {itemLocked ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-danger-bg text-danger rounded-full text-xs font-bold">
                          <Lock size={14} />
                          <span>
                            {sequenceLocked &&
                            !monthIsLocked &&
                            item.locked !== true
                              ? "أكمل العنصر السابق"
                              : "غير متاح"}
                          </span>
                        </div>
                      ) : itemCompleted ? (
                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-success-bg text-success rounded-full text-xs font-bold">
                          <span>مكتمل</span>
                          <span className="w-5 h-5 flex items-center justify-center bg-success/10 rounded-full">
                            ✓
                          </span>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-2 px-3 py-1.5 bg-background border border-border text-text-muted rounded-full text-xs font-bold">
                          <span>قيد التقدم</span>
                        </div>
                      )}
                    </div>
                  </div>
                );

                if (itemLocked) {
                  return (
                    <div
                      key={item._id}
                      className="block w-full cursor-not-allowed"
                      aria-disabled="true"
                    >
                      {row}
                    </div>
                  );
                }

                return (
                  <Link
                    href={href}
                    key={item._id}
                    className="block group w-full"
                  >
                    {row}
                  </Link>
                );
              })}
            </div>
          ) : loadError ? (
            <div className="flex flex-col items-center justify-center w-full py-16 bg-surface border border-border rounded-card text-center">
              <span className="text-danger font-bold text-base">
                {loadError}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center w-full py-16 bg-surface border border-border rounded-card text-center px-4">
              <h3 className="font-extrabold text-xl text-text-main mb-2">
                لا يوجد محتوى في هذا الشهر حالياً
              </h3>
              <p className="font-medium text-sm text-text-muted max-w-md">
                نعمل على إضافة الدروس والاختبارات قريباً. يرجى العودة لاحقاً
                لاستكمال خطتك الدراسية.
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
