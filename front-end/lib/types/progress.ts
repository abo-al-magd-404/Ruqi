export type LessonProgressType = "video" | "explanation" | "book";

export interface LessonProgress {
  _id?: string;
  student?: string;
  lesson: string;
  videoCompleted: boolean;
  explanationCompleted: boolean;
  homeworkCompleted: boolean;
  bookCompleted: boolean;
  videoPoints: number;
  explanationPoints: number;
  homeworkPoints: number;
  totalPoints: number;
  completed: boolean;
}

export interface HomeworkResult {
  correctAnswers: number;
  totalQuestions: number;
  points: number;
  bestPoints: number;
  totalPoints: number;
  completed: boolean;
}

export interface ExamProgress {
  _id?: string;
  student?: string;
  exam: string;
  correctAnswers: number;
  totalQuestions: number;
  points: number;
  bonusPoints: number;
  totalPoints: number;
  passed: boolean;
}

export interface ExamResult extends ExamProgress {
  percentage: number;
  bestPoints: number;
}

export interface MonthProgressLesson {
  lesson: string;
  title: string;
  order: number;
  videoCompleted: boolean;
  explanationCompleted: boolean;
  homeworkCompleted: boolean;
  bookCompleted: boolean;
  videoPoints: number;
  explanationPoints: number;
  homeworkPoints: number;
  totalPoints: number;
  completed: boolean;
}

export interface MonthProgressExam {
  exam: string;
  title: string;
  order: number;
  correctAnswers: number;
  totalQuestions: number;
  points: number;
  bonusPoints: number;
  totalPoints: number;
  passed: boolean;
}

export interface MonthProgressSummary {
  totalPoints: number;
  lessonPoints: number;
  examPoints: number;
  totalLessons: number;
  completedLessons: number;
  totalExams: number;
  completedExams: number;
}

export interface MonthProgress {
  month: string;
  lessons: MonthProgressLesson[];
  exams: MonthProgressExam[];
  summary: MonthProgressSummary;
}
