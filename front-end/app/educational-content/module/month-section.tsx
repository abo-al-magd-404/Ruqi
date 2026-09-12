"use client";

import { ArrowDown, ArrowUp, Loader2, Plus } from "lucide-react";
import type { EducationalStage, Month } from "@/lib/types/educational-content";

interface MonthSectionProps {
  months: Month[];
  selectedStage: EducationalStage | null;
  selectedMonthId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onAdd: () => void;
  onEdit: (month: Month) => void;
  onDelete: (month: Month) => void;
}

export default function MonthSection({
  months,
  selectedStage,
  selectedMonthId,
  loading,
  onSelect,
  onMove,
  onAdd,
  onEdit,
  onDelete,
}: MonthSectionProps) {
  return (
    <section className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 w-full">
        <h2 className="font-extrabold text-[20px] text-text-main flex-1 min-w-0 break-words">
          إدارة الأشهر {selectedStage ? `[${selectedStage.title}]` : ""}
        </h2>
        {selectedStage && (
          <button
            onClick={onAdd}
            className="w-full sm:w-auto shrink-0 border border-primary text-primary-hover hover:bg-primary-light font-bold text-[14px] px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-1"
          >
            <Plus size={16} />
            إنشاء شهر جديد
          </button>
        )}
      </div>

      {!selectedStage ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
          اختر مرحلة دراسية لعرض أشهرها.
        </div>
      ) : loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary-hover" size={32} />
        </div>
      ) : months.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
          لا توجد أشهر لهذه المرحلة. أنشئ شهراً جديداً.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {months.map((month, index) => (
            <div
              key={month._id}
              onClick={() => onSelect(month._id)}
              className={`cursor-pointer flex flex-col gap-4 border rounded-xl p-5 transition-colors ${
                selectedMonthId === month._id
                  ? "bg-primary-light border-[1.5px] border-primary"
                  : "bg-surface border-[1.5px] border-border hover:border-primary"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div className="flex flex-col gap-1 flex-1 min-w-0">
                  <span className="font-bold text-[15px] text-text-main break-words">{month.title}</span>
                  <span className="font-normal text-[13px] text-text-muted">
                    {month.price > 0 ? `السعر: ${month.price} ج.م` : "مجاني"}
                  </span>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(index, -1);
                    }}
                    disabled={index === 0}
                    className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                    aria-label="تحريك لأعلى"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMove(index, 1);
                    }}
                    disabled={index === months.length - 1}
                    className="disabled:opacity-30 text-primary-hover hover:bg-surface rounded p-1.5 transition-colors"
                    aria-label="تحريك لأسفل"
                  >
                    <ArrowDown size={16} />
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mt-auto pt-2 border-t border-border/50">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(month);
                  }}
                  className="bg-danger-bg text-danger hover:bg-danger-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 text-center shrink-0"
                >
                  حذف
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(month);
                  }}
                  className="bg-primary-light border border-primary-border text-primary-hover hover:bg-primary-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 text-center shrink-0"
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