"use client";

import { useTeacherDashboard } from "./use-teacher-dashboard";
import StageSection from "./stage-section";
import MonthSection from "./month-section";
import ContentSection from "./content-section";
import DeleteConfirmModal from "./delete-confirm-modal";
import StageModal from "./stage-modal";
import MonthModal from "./month-modal";
import ContentModal from "./content-modal";

export default function TeacherDashboard() {
  const dash = useTeacherDashboard();

  return (
    <div
      className="w-full min-h-screen bg-background font-cairo py-10 px-4 md:px-8 lg:px-[80px] overflow-x-hidden"
      dir="rtl"
    >
      <main className="w-full max-w-[1280px] mx-auto flex flex-col gap-8">
        {dash.error && (
          <div className="bg-danger-bg border border-danger text-danger font-bold text-[13px] p-4 rounded-xl text-center">
            {dash.error}
          </div>
        )}

        <StageSection
          stages={dash.stages}
          selectedStageId={dash.selectedStageId}
          loading={dash.loadingStages}
          onSelect={dash.selectStage}
          onMove={dash.moveStage}
          onAdd={dash.openStageCreate}
          onEdit={dash.openStageEdit}
          onDelete={(stage) => dash.requestDelete({ kind: "stage", stage })}
        />

        <MonthSection
          months={dash.months}
          selectedStage={dash.selectedStage}
          selectedMonthId={dash.selectedMonthId}
          loading={dash.loadingMonths}
          onSelect={dash.selectMonth}
          onMove={dash.moveMonth}
          onAdd={dash.openMonthCreate}
          onEdit={dash.openMonthEdit}
          onDelete={(month) =>
            dash.selectedStage
              ? dash.requestDelete({ kind: "month", stage: dash.selectedStage, month })
              : undefined
          }
        />

        <ContentSection
          content={dash.content}
          selectedMonth={dash.selectedMonth}
          loading={dash.loadingContent}
          onMove={dash.moveContent}
          onAddExam={dash.openExamCreate}
          onAddLesson={dash.openLessonCreate}
          onEdit={dash.openContentEdit}
          onDelete={(item) =>
            dash.selectedStage && dash.selectedMonth
              ? dash.requestDelete({ kind: "content", stage: dash.selectedStage, month: dash.selectedMonth, content: item })
              : undefined
          }
        />
      </main>

      <StageModal
        open={dash.stageModalOpen}
        mode={dash.stageModalMode}
        initialTitle={dash.editingStage?.title ?? ""}
        initialImage={dash.editingStage?.image ?? ""}
        saving={dash.saving}
        error={dash.modalError}
        onSave={dash.handleStageSave}
        onClose={dash.closeStageModal}
      />

      <MonthModal
        open={dash.monthModalOpen}
        mode={dash.monthModalMode}
        initialTitle={dash.editingMonth?.title ?? ""}
        initialDescription={dash.editingMonth?.description ?? ""}
        initialPrice={dash.editingMonth?.price ?? 0}
        initialImage={dash.editingMonth?.image ?? ""}
        saving={dash.saving}
        error={dash.modalError}
        onSave={dash.handleMonthSave}
        onClose={dash.closeMonthModal}
      />

      <ContentModal
        open={dash.contentModalOpen}
        mode={dash.contentModalMode}
        type={dash.contentType}
        initialTitle={dash.editingContent?.title ?? ""}
        initialDescription={dash.editingContent?.description ?? ""}
        initialImage={dash.editingContent?.image ?? ""}
        initialNote={dash.editingContent?.note ?? ""}
        initialVideoUrl={dash.editingContent?.videoUrl ?? ""}
        initialWrittenExplanation={dash.editingContent?.writtenExplanation ?? ""}
        initialPassPercentage={dash.editingContent?.passPercentage ?? 50}
        initialQuestions={
          dash.editingContent
            ? ((dash.editingContent.type === "EXAM" ? dash.editingContent.examQuestions : dash.editingContent.homework) ?? [])
            : []
        }
        saving={dash.saving}
        error={dash.modalError}
        onSave={dash.handleContentSave}
        onClose={dash.closeContentModal}
        onSwitchType={dash.setContentType}
      />

      <DeleteConfirmModal
        open={dash.confirmOpen}
        deleteMessage={dash.deleteMessage}
        deleting={dash.deleting}
        error={dash.modalError}
        onConfirm={dash.handleDelete}
        onClose={dash.closeConfirm}
      />
    </div>
  );
}