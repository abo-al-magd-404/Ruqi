"use client";

// Mobile-only drawer that lists a month's content (shown under the lg breakpoint).
// It animates open/closed through a small state machine. Locked items render as
// non-clickable rows with a lock icon and a "complete the previous item" hint;
// the current lesson shows its per-stage completion chips.

import { useState } from "react";
import Link from "next/link";
import { X, ChevronUp, Play, Check, Circle, Lock } from "lucide-react";
import type { ContentItem } from "@/lib/types/educational-content";

export interface LessonStages {
  video: boolean;
  explanation: boolean;
  book: boolean;
  training?: boolean;
}

interface MonthDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  contentList: ContentItem[];
  currentContentId: string;
  currentIndex: number;
  contentPosition: number;
  totalItems: number;
  lockedIds?: Set<string>;
  currentLessonStages?: LessonStages | null;
}

export default function MonthDrawer({
  isOpen,
  onClose,
  title,
  contentList,
  currentContentId,
  currentIndex,
  contentPosition,
  totalItems,
  lockedIds,
  currentLessonStages,
}: MonthDrawerProps) {
  // Animate the slide-in/out via a small open state machine.
  const [stage, setStage] = useState<"closed" | "opening" | "open" | "closing">("closed");
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen && stage === "closed") {
      setStage("opening");
    } else if (!isOpen && stage === "open") {
      setStage("closing");
    }
  }

  const onTransitionEnd = () => {
    if (stage === "opening") setStage("open");
    if (stage === "closing") setStage("closed");
  };

  const isRendered = stage !== "closed";

  return (
    <div
      className={`fixed inset-0 z-[1100] lg:hidden font-cairo ${isRendered ? "" : "pointer-events-none"}`}
      dir="rtl"
    >
      <div
        className={`absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity duration-300 ${
          stage === "opening" || stage === "open" ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      <div
        className={`absolute bottom-0 left-0 right-0 flex items-end transition-transform duration-300 ease-out ${
          stage === "opening" || stage === "open" ? "translate-y-0" : "translate-y-full"
        }`}
        onTransitionEnd={onTransitionEnd}
      >
        <div className="w-full max-h-[80vh] bg-background border-t border-border rounded-t-[24px] shadow-2xl flex flex-col">
          <div className="flex items-center justify-center pt-3 pb-1 shrink-0">
            <span className="w-12 h-1.5 rounded-full bg-border" />
          </div>
          <div className="flex items-center justify-between px-5 pb-3 pt-1 border-b border-border shrink-0">
            <span className="font-extrabold text-[15px] text-text-main">
              {title}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-control bg-surface border border-border text-text-muted hover:text-text-main transition-colors"
              aria-label="إغلاق القائمة"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2.5">
            <span className="mb-1 font-bold text-[12px] text-primary px-1">
              الدرس {contentPosition} من {totalItems} في هذا المنهج
            </span>
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
                // الفيديو = video / الشرح = explanation / الكتاب المطلوب = required book /
                // التدريب = training.
                const stageChips = [
                  { label: "الفيديو", done: currentLessonStages?.video ?? false },
                  { label: "الشرح", done: currentLessonStages?.explanation ?? false },
                  { label: "الكتاب المطلوب", done: currentLessonStages?.book ?? false },
                  { label: "التدريب", done: currentLessonStages?.training ?? false },
                ];

                const rowClass = `rounded-[12px] transition-all duration-200 w-full min-h-[52px] ${
                  isCurrent
                    ? "bg-primary-light border border-primary"
                    : isCompleted
                      ? "bg-transparent border border-primary"
                      : "bg-transparent border border-border"
                }`;

                const rowInner = (
                  <>
                    <div className="flex flex-row items-center justify-between p-3.5 w-full">
                      <div className="flex flex-row items-center justify-between w-full">
                        <div className="flex flex-row items-center min-w-0">
                          <div
                            className={`w-6 h-6 rounded-[10px] flex items-center justify-center shrink-0 ml-3 ${
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
                              <Play size={10} fill="currentColor" className="ml-0.5" />
                            ) : isLocked ? (
                              <Lock size={11} />
                            ) : isCompleted ? (
                              <Check size={12} strokeWidth={3} />
                            ) : (
                              <Circle size={6} fill="currentColor" />
                            )}
                          </div>
                          <span
                            className={`text-[14px] truncate text-right ${
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
                        </div>
                        {isLocked && (
                          // "أكمل العنصر السابق" = "Complete the previous item first".
                          <span className="shrink-0 text-[11px] font-bold text-danger ml-2">
                            أكمل العنصر السابق
                          </span>
                        )}
                      </div>
                    </div>
                    {showStages && (
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
                            {chip.done ? (
                              <Check size={11} strokeWidth={3} />
                            ) : (
                              <Circle size={5} fill="currentColor" />
                            )}
                            {chip.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </>
                );

                // Locked rows render as disabled divs instead of links.
                if (isLocked) {
                  return (
                    <div key={item._id} className={`block w-full cursor-not-allowed ${rowClass}`} aria-disabled="true" dir="rtl">
                      {rowInner}
                    </div>
                  );
                }

                return (
                  <Link href={href} key={item._id} onClick={onClose} className={`block w-full ${rowClass}`} dir="rtl">
                    {rowInner}
                  </Link>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Floating button on small screens that re-opens the drawer.
export function MonthDrawerButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="sticky bottom-4 w-full flex justify-center pointer-events-none lg:hidden mt-auto pt-6 z-[1050] font-cairo" dir="rtl">
      <button
        type="button"
        onClick={onClick}
        className="pointer-events-auto flex flex-row items-center justify-center gap-2.5 px-8 h-[56px] bg-footer rounded-full shadow-[0_12px_28px_rgba(0,0,0,0.3)] border border-border/20 transition-transform active:scale-95"
        aria-label="فتح محتويات الشهر"
      >
        <span className="text-[15px] font-bold text-primary leading-none">
          محتويات الشهر
        </span>
        <ChevronUp size={22} className="text-primary" strokeWidth={2.5} />
      </button>
    </div>
  );
}
