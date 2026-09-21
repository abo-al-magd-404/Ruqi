"use client";

import { ArrowDown, ArrowUp, Loader2, Plus } from "lucide-react";
import type { EducationalStage } from "@/lib/types/educational-content";

interface StageSectionProps {
  stages: EducationalStage[];
  selectedStageId: string | null;
  loading: boolean;
  onSelect: (id: string) => void;
  onMove: (index: number, dir: -1 | 1) => void;
  onAdd: () => void;
  onEdit: (stage: EducationalStage) => void;
  onDelete: (stage: EducationalStage) => void;
}

export default function StageSection({
  stages,
  selectedStageId,
  loading,
  onSelect,
  onMove,
  onAdd,
  onEdit,
  onDelete,
}: StageSectionProps) {
  return (
    <section className="flex flex-col gap-4 w-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="font-extrabold text-[20px] text-text-main">
          المراحل الدراسية
        </h2>
        <button
          onClick={onAdd}
          className="w-full sm:w-auto shrink-0 bg-primary hover:bg-primary-hover text-text-main font-bold text-[14px] px-5 py-2.5 rounded-xl transition-colors flex items-center justify-center gap-1"
        >
          <Plus size={16} />
          إضافة مرحلة دراسية
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="animate-spin text-primary-hover" size={32} />
        </div>
      ) : stages.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-8 text-center text-text-muted font-bold">
          لا توجد مراحل دراسية بعد. ابدأ بإضافة مرحلة جديدة.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {stages.map((stage, index) => (
            <div
              key={stage._id}
              onClick={() => onSelect(stage._id)}
              className={`cursor-pointer flex flex-col gap-4 border rounded-[16px] p-5 transition-colors ${
                selectedStageId === stage._id
                  ? "bg-primary-light border-[1.5px] border-primary"
                  : "bg-surface border-[1.5px] border-border hover:border-primary"
              }`}
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <span className="font-extrabold text-[16px] text-text-main wrap-break-word flex-1 min-w-0">
                  {stage.title}
                </span>
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
                    disabled={index === stages.length - 1}
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
                    onDelete(stage);
                  }}
                  className="bg-danger-bg text-danger hover:bg-danger-hover hover:text-white font-bold text-[12px] px-3 py-1.5 rounded-md transition-colors flex-1 text-center shrink-0"
                >
                  حذف
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(stage);
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
