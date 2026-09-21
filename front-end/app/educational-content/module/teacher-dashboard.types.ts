// Shared types for the teacher dashboard CRUD forms.

import type {
  ContentQuestion,
  EducationalStage,
  LessonExam,
  Month,
} from "@/lib/types/educational-content";

// Whether a modal is adding a new record or editing an existing one.
export type ModalMode = "create" | "edit";

// Describes what is about to be deleted so the confirm modal can show a message
// and the handler can clean up the right hierarchy level.
export type DeleteTarget =
  | { kind: "stage"; stage: EducationalStage }
  | { kind: "month"; stage: EducationalStage; month: Month }
  | { kind: "content"; stage: EducationalStage; month: Month; content: LessonExam };

export interface StageFormValues {
  title: string;
  image: string;
}

export interface MonthFormValues {
  title: string;
  description: string;
  price: number;
  image: string;
}

export interface ContentFormValues {
  title: string;
  description: string;
  image: string;
  note: string;
  videoUrl: string;
  writtenExplanation: string;
  passPercentage: number;
  questions: ContentQuestion[];
}