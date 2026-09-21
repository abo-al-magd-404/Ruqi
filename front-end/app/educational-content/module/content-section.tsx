"use client";

// "Content (المحتوى)" management section of the teacher dashboard.
// Lists the lessons/exams of the selected month with reorder, delete and edit
// actions, plus buttons to create a new lesson or exam.

import { ArrowDown, ArrowUp, Loader2, Plus } from "lucide-react";
import type { LessonExam, Month } from "@/lib/types/educational-content";

interface ContentSectionProps {
  content: LessonExam[];
  selectedMonth: Month | null;
  loading: boolean;
  onMove: (index: number, dir: -1 | 1) => void;
  onAddExam: () => void;
  onAddLesson: () => void;
  onEdit: (item: LessonExam) => void;
  onDelete: (item: LessonExam) => void;
}

export default function ContentSection({
  content,
  selectedMonth,
  loading,
  onMove,
  onAddExam,
  onAddLesson,
  onEdit,
  onDelete,
}: ContentSectionProps) {
  return (
    <section className="flex flex-col gap-4 w-full pb-12">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 w-full">
        <h2 className="font-extrabold text-[20px] text-text-main flex-1 min-w-0 break-words">
          المحتوى المتتابع {selectedMonth ? `[${selectedMonth.title}]` : ""}
        </h2>
        {selectedMonth && (
          <div className="flex flex-col sm:flex-row items-stretch gap-3 w-full lg:w-auto shrink-0">
            <button
              onClick={onAddLesson}
              className="bg-primary hover:bg-primary-hover text-text-main font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 w-full sm:w-auto shrink-0"
            >
              <Plus size={16} />
              إنشاء درس
            </button>
            <button
              onClick={onAddExam}
              className="bg-text-main hover:bg-black text-primary font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1 w-full sm:w-auto shrink-0"
            >
              <Plus size={16} />
              إنشاء اختبار
            </button>
          </div>
        )}
      </div>

      {!selectedMonth ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
          اختر شهراً لعرض محتواه.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary-hover" size={32} />
        </div>
      ) : content.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
          لا يوجد محتوى في هذا الشهر بعد.
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-[16px] flex flex-col overflow-hidden">
          {content.map((item, index) => (
            <div
              key={item._id}
              className={`flex flex-col lg:flex-row justify-between items-start lg:items-center p-5 gap-5 ${
                index !== content.length - 1 ? "border-b border-border" : ""
              }`}
            >
              <div className="flex items-start sm:items-center gap-3 w-full lg:w-auto flex-1 min-w-0">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1 sm:mt-0 ${
                    item.type === "EXAM" ? "bg-success-bg" : "bg-primary-light"
                  }`}
                >
                  <span
                    className={`font-extrabold text-[14px] ${
                      item.type === "EXAM" ? "text-success" : "text-primary-hover"
                    }`}
                  >
                    {index + 1}
                  </span>
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                  <h3 className="font-semibold text-[15px] text-text-main break-words">{item.title}</h3>
                  <span
                    className={`font-bold text-[12px] px-3 py-1 rounded-md w-fit whitespace-nowrap shrink-0 ${
                      item.type === "EXAM" ? "bg-success-bg text-success" : "bg-primary-light text-primary-hover"
                    }`}
                  >
                    {item.type === "EXAM" ? "اختبار" : "درس مرئي"}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 self-start lg:self-auto w-full lg:w-auto justify-end shrink-0">
                <div className="flex items-center gap-1 shrink-0 ml-auto lg:ml-2">
                  <button
                    type="button"
                    onClick={() => onMove(index, -1)}
                    disabled={index === 0}
                    className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                    aria-label="تحريك لأعلى"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => onMove(index, 1)}
                    disabled={index === content.length - 1}
                    className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                    aria-label="تحريك لأسفل"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => onDelete(item)}
                  className="bg-danger-bg text-danger hover:bg-danger-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 sm:flex-none text-center shrink-0"
                >
                  حذف
                </button>
                <button
                  type="button"
                  onClick={() => onEdit(item)}
                  className="bg-primary-light border border-primary-border text-primary-hover hover:bg-primary-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 sm:flex-none text-center shrink-0"
                >
                  تعديل
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}