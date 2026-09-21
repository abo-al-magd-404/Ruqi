"use client";

// Desktop-only sidebar (lg breakpoint and up) that lists a month's content.
// Mirrors MonthDrawer: locked items render as non-clickable rows with a lock
// icon and a "complete the previous item" hint, and the current lesson shows
// its per-stage completion chips.

import Link from "next/link";
import { Play, Check, Circle, Lock } from "lucide-react";
import type { ContentItem } from "@/lib/types/educational-content";

interface MonthSidebarProps {
  title: string;
  contentList: ContentItem[];
  currentContentId: string;
  currentIndex: number;
  contentPosition: number;
  totalItems: number;
  lockedIds?: Set<string>;
  currentLessonStages?: { video: boolean; explanation: boolean; book: boolean; training?: boolean } | null;
}

export default function MonthSidebar({
  title,
  contentList,
  currentContentId,
  currentIndex,
  contentPosition,
  totalItems,
  lockedIds,
  currentLessonStages,
}: MonthSidebarProps) {
  return (
    <aside className="hidden lg:flex w-full lg:w-[360px] bg-surface border border-border shadow-[0_8px_24px_rgba(84,70,58,0.04)] rounded-card p-6 flex-col gap-6 lg:sticky lg:top-24 shrink-0">
      <div className="flex flex-col items-start gap-3 pb-3 border-b border-border w-full">
        <span className="font-bold text-[14px] text-primary">
          الدرس {contentPosition} من {totalItems} في هذا المنهج
        </span>
        <h3 className="font-extrabold text-[18px] text-text-main">{title}</h3>
      </div>

      <div className="flex flex-col gap-3 w-full">
        {contentList.length === 0 ? (
          <div className="text-center py-6 font-medium text-sm text-text-muted">
            لا توجد عناصر في هذا الشهر بعد.
          </div>
        ) : (
          contentList.map((item, index) => {
            // Locked items are excluded from click-through; the currently open item is
            // never considered locked.
            const isCurrent = item._id === currentContentId;
            const isCompleted = currentIndex !== -1 && index < currentIndex;
            const isLessonItem = item.type === "LESSON";
            const isLocked = lockedIds?.has(String(item._id)) === true && !isCurrent;
            const href = isLessonItem
              ? `/educational-content/content/${item._id}`
              : `/educational-content/exam/${item._id}`;
            const showStages = isCurrent && isLessonItem && !!currentLessonStages;

            // Stage chips shown under the current lesson:
            // الفيديو = video / الشرح = explanation / الكتاب = required book /
            // التدريب = training.
            const stageChips = [
              { label: "الفيديو", done: currentLessonStages?.video ?? false },
              { label: "الشرح", done: currentLessonStages?.explanation ?? false },
              { label: "الكتاب", done: currentLessonStages?.book ?? false },
              { label: "التدريب", done: currentLessonStages?.training ?? false },
            ];

            const rowClass = `block w-full rounded-[12px] transition-all duration-200 ${
              isCurrent
                ? "bg-primary-light border border-primary"
                : isCompleted
                  ? "bg-transparent border border-primary"
                  : "bg-transparent border border-border"
            }`;

            const rowInner = (
              <div className={`flex flex-row items-center justify-between p-4 w-full min-h-[58px] ${isLocked ? "opacity-70" : ""}`}>
                <div
                  className={`w-6 h-6 rounded-[12px] flex items-center justify-center shrink-0 ml-3 ${
                    isCurrent
                      ? "bg-primary text-surface"
                      : isLocked
                        ? "bg-surface-secondary text-text-muted"
                        : isCompleted
                          ? "bg-success-bg text-success"
                          : "bg-surface-secondary text-text-main"
                  }`}
                >
                  {isCurrent ? (
                    <Play size={12} fill="currentColor" className="ml-0.5" />
                  ) : isLocked ? (
                    <Lock size={12} />
                  ) : isCompleted ? (
                    <Check size={14} strokeWidth={3} />
                  ) : (
                    <Circle size={8} fill="currentColor" />
                  )}
                </div>

                <span
                  className={`text-[14px] truncate flex-1 text-right ${
                    isCurrent
                      ? "font-bold text-primary-hover"
                      : isLocked
                        ? "font-medium text-text-muted"
                        : isCompleted
                          ? "font-medium text-text-main"
                          : "font-medium text-text-muted"
                  }`}
                >
                  {item.title}
                </span>

                {isLocked && (
                  // "أكمل العنصر السابق" = "Complete the previous item first".
                  <span className="shrink-0 text-[11px] font-bold text-danger ml-2">
                    أكمل العنصر السابق
                  </span>
                )}
              </div>
            );

            const stagesBlock = showStages ? (
              <div className="flex items-center gap-1.5 px-4 pb-3 pt-1">
                {stageChips.map((chip) => (
                  <span
                    key={chip.label}
                    className={`inline-flex items-center gap-1 px-2 py-1 rounded-control text-[10px] font-bold border ${
                      chip.done
                        ? "bg-success-bg text-success border-success/30"
                        : "bg-background text-text-muted border-border"
                    }`}
                  >
                    {chip.done ? <Check size={11} strokeWidth={3} /> : <Circle size={5} fill="currentColor" />}
                    {chip.label}
                  </span>
                ))}
              </div>
            ) : null;

            // Locked rows render as disabled divs instead of links.
            if (isLocked) {
              return (
                <div key={item._id} className={rowClass} aria-disabled="true" dir="rtl">
                  {rowInner}
                  {stagesBlock}
                </div>
              );
            }

            return (
              <Link href={href} key={item._id} className={rowClass} dir="rtl">
                {rowInner}
                {stagesBlock}
              </Link>
            );
          })
        )}
      </div>
    </aside>
  );
}