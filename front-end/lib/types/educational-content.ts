export type ContentType = "LESSON" | "EXAM";

export interface ContentQuestion {
  questionText: string;
  options: string[];
  correctAnswers: number[];
}

export type Question = ContentQuestion;

export interface EducationalStage {
  _id: string;
  title: string;
  image?: string | null;
  order: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Month {
  _id: string;
  title: string;
  description: string;
  image?: string | null;
  price: number;
  stage: string;
  order: number;
  locked?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type EducationalMonth = Month;

export interface LessonExam {
  _id: string;
  type: ContentType;
  title: string;
  description: string;
  image?: string | null;
  month: string;
  order: number;
  locked?: boolean;
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: ContentQuestion[];
  examQuestions?: ContentQuestion[];
  passPercentage?: number;
  createdAt?: string;
  updatedAt?: string;
}

export type ContentItem = Pick<
  LessonExam,
  "_id" | "title" | "description" | "type" | "order"
> & { locked?: boolean };

export interface MonthContent {
  locked: boolean;
  items: LessonExam[];
}

export interface ContentDetails {
  _id: string;
  title: string;
  description?: string;
  type: "LESSON" | "EXAM";
  locked?: boolean;
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: Question[];
  examQuestions?: Question[];
  passPercentage?: number;
  order: number;
  month: string;
}

export interface ReorderItem {
  id: string;
  order: number;
}

export interface StagePayload {
  title: string;
  image?: string;
  order?: number;
}

export interface MonthPayload {
  title: string;
  description: string;
  image?: string;
  price?: number;
  stage?: string;
  order?: number;
}

export interface LessonPayload {
  title: string;
  description: string;
  month: string;
  type: ContentType;
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: ContentQuestion[];
  order?: number;
}

export interface ExamPayload {
  title: string;
  description: string;
  month: string;
  type: ContentType;
  examQuestions?: ContentQuestion[];
  passPercentage?: number;
  order?: number;
}

export interface ContentPayload {
  title?: string;
  description?: string;
  videoUrl?: string;
  writtenExplanation?: string;
  homework?: ContentQuestion[];
  examQuestions?: ContentQuestion[];
  passPercentage?: number;
  order?: number;
  image?: string;
}

export interface PlatformStats {
  stages: number;
  months: number;
  lessons: number;
  exams: number;
}