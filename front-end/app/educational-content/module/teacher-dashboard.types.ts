import type {
  ContentQuestion,
  EducationalStage,
  LessonExam,
  Month,
} from "@/lib/types/educational-content";

export type ModalMode = "create" | "edit";

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