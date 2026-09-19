import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { SubmitAnswersDto, UpdateLessonProgressDto } from "./dto";
import {
  Exam,
  ExamDocument,
  ExamProgress,
  ExamProgressDocument,
  Lesson,
  LessonDocument,
  LessonProgress,
  LessonProgressDocument,
} from "../../schemas";
import { LessonProgressType } from "../../common/enums";
import { IQuestion } from "../../common/interfaces";

@Injectable()
export class ProgressService {
  constructor(
    @InjectModel(LessonProgress.name)
    private readonly lessonProgressModel: Model<LessonProgressDocument>,

    @InjectModel(ExamProgress.name)
    private readonly examProgressModel: Model<ExamProgressDocument>,

    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,

    @InjectModel(Exam.name)
    private readonly examModel: Model<ExamDocument>,
  ) {}

  // ============================================================
  // Lesson Progress
  // ============================================================

  async updateLessonProgress(
    studentId: Types.ObjectId,
    lessonId: Types.ObjectId,
    dto: UpdateLessonProgressDto,
  ) {
    const lesson = await this.lessonModel.findById(lessonId);

    if (!lesson) {
      throw new NotFoundException("الدرس غير موجود");
    }

    let lessonProgress = await this.lessonProgressModel.findOne({
      student: studentId,
      lesson: lessonId,
    });

    if (!lessonProgress) {
      lessonProgress = new this.lessonProgressModel({
        student: studentId,
        lesson: lessonId,
      });
    }

    switch (dto.type) {
      case LessonProgressType.VIDEO:
        if (!lessonProgress.videoCompleted) {
          lessonProgress.videoCompleted = true;
          lessonProgress.videoPoints = 10;
        }
        break;

      case LessonProgressType.EXPLANATION:
        if (!lessonProgress.explanationCompleted) {
          lessonProgress.explanationCompleted = true;
          lessonProgress.explanationPoints = 10;
        }
        break;

      case LessonProgressType.BOOK:
        if (!lesson.note) {
          throw new BadRequestException("هذا الدرس لا يحتوي على كتاب مطلوب");
        }

        lessonProgress.bookCompleted = true;
        break;

      default:
        throw new BadRequestException("نوع التقدم غير صالح");
    }

    this.updateLessonTotalPoints(lessonProgress);

    this.updateLessonCompletion(lesson, lessonProgress);

    await lessonProgress.save();

    return {
      message: "تم تحديث تقدم الدرس بنجاح",
      data: lessonProgress,
    };
  }

  async submitHomework(
    studentId: Types.ObjectId,
    lessonId: Types.ObjectId,
    dto: SubmitAnswersDto,
  ) {
    const lesson = await this.lessonModel.findById(lessonId);

    if (!lesson) {
      throw new NotFoundException("الدرس غير موجود");
    }

    if (!lesson.homework || lesson.homework.length === 0) {
      throw new BadRequestException("هذا الدرس لا يحتوي على واجب");
    }

    this.validateAnswersCount(dto.answers, lesson.homework);

    const correctAnswers = this.calculateCorrectAnswers(
      lesson.homework,
      dto.answers,
    );

    const homeworkPoints = correctAnswers;

    let lessonProgress = await this.lessonProgressModel.findOne({
      student: studentId,
      lesson: lessonId,
    });

    if (!lessonProgress) {
      lessonProgress = new this.lessonProgressModel({
        student: studentId,
        lesson: lessonId,
      });
    }

    if (homeworkPoints > lessonProgress.homeworkPoints) {
      lessonProgress.homeworkPoints = homeworkPoints;
    }

    lessonProgress.homeworkCompleted = true;

    this.updateLessonTotalPoints(lessonProgress);

    this.updateLessonCompletion(lesson, lessonProgress);

    await lessonProgress.save();

    return {
      message: "تم تسليم الواجب بنجاح",
      data: {
        correctAnswers,
        totalQuestions: lesson.homework.length,
        points: homeworkPoints,
        bestPoints: lessonProgress.homeworkPoints,
        totalPoints: lessonProgress.totalPoints,
        completed: lessonProgress.completed,
      },
    };
  }

  // ============================================================
  // Get Lesson Progress
  // ============================================================

  async getLessonProgress(studentId: Types.ObjectId, lessonId: Types.ObjectId) {
    const lesson = await this.lessonModel.findById(lessonId);

    if (!lesson) {
      throw new NotFoundException("الدرس غير موجود");
    }

    const progress = await this.lessonProgressModel.findOne({
      student: studentId,
      lesson: lessonId,
    });

    if (!progress) {
      return {
        data: {
          lesson: lessonId,
          videoCompleted: false,
          explanationCompleted: false,
          homeworkCompleted: lesson.homework.length === 0,
          bookCompleted: !lesson.note,
          videoPoints: 0,
          explanationPoints: 0,
          homeworkPoints: 0,
          totalPoints: 0,
          completed: false,
        },
      };
    }

    return {
      data: progress,
    };
  }

  // ============================================================
  // Exam Progress
  // ============================================================

  async submitExam(
    studentId: Types.ObjectId,
    examId: Types.ObjectId,
    dto: SubmitAnswersDto,
  ) {
    const exam = await this.examModel.findById(examId);

    if (!exam) {
      throw new NotFoundException("الاختبار غير موجود");
    }

    if (!exam.examQuestions || exam.examQuestions.length === 0) {
      throw new BadRequestException("هذا الاختبار لا يحتوي على أسئلة");
    }

    this.validateAnswersCount(dto.answers, exam.examQuestions);

    const correctAnswers = this.calculateCorrectAnswers(
      exam.examQuestions,
      dto.answers,
    );

    const totalQuestions = exam.examQuestions.length;

    const points = correctAnswers;

    const isPerfect = correctAnswers === totalQuestions;

    const bonusPoints = isPerfect ? 5 : 0;

    const totalPoints = points + bonusPoints;

    const percentage = (correctAnswers / totalQuestions) * 100;

    const passed = percentage >= exam.passPercentage;

    let examProgress = await this.examProgressModel.findOne({
      student: studentId,
      exam: examId,
    });

    if (!examProgress) {
      examProgress = new this.examProgressModel({
        student: studentId,
        exam: examId,
        correctAnswers,
        totalQuestions,
        points,
        bonusPoints,
        totalPoints,
        passed,
      });

      await examProgress.save();
    } else if (totalPoints > examProgress.totalPoints) {
      examProgress.correctAnswers = correctAnswers;

      examProgress.totalQuestions = totalQuestions;

      examProgress.points = points;

      examProgress.bonusPoints = bonusPoints;

      examProgress.totalPoints = totalPoints;

      examProgress.passed = passed;

      await examProgress.save();
    }

    return {
      message: "تم تسليم الاختبار بنجاح",
      data: {
        correctAnswers,
        totalQuestions,
        points,
        bonusPoints,
        totalPoints,
        percentage,
        passed,
        bestPoints: examProgress.totalPoints,
      },
    };
  }

  // ============================================================
  // Get Exam Progress
  // ============================================================

  async getExamProgress(studentId: Types.ObjectId, examId: Types.ObjectId) {
    const exam = await this.examModel.findById(examId);

    if (!exam) {
      throw new NotFoundException("الاختبار غير موجود");
    }

    const progress = await this.examProgressModel.findOne({
      student: studentId,
      exam: examId,
    });

    if (!progress) {
      return {
        data: {
          exam: examId,
          correctAnswers: 0,
          totalQuestions: exam.examQuestions.length,
          points: 0,
          bonusPoints: 0,
          totalPoints: 0,
          passed: false,
        },
      };
    }

    return {
      data: progress,
    };
  }

  // ============================================================
  // Get Month Progress
  // ============================================================

  async getMonthProgress(studentId: Types.ObjectId, monthId: Types.ObjectId) {
    const lessons = await this.lessonModel
      .find({
        month: monthId,
      })
      .sort({ order: 1 });

    const exams = await this.examModel
      .find({
        month: monthId,
      })
      .sort({ order: 1 });

    const lessonIds = lessons.map((lesson) => lesson._id);

    const examIds = exams.map((exam) => exam._id);

    const [lessonProgress, examProgress] = await Promise.all([
      this.lessonProgressModel.find({
        student: studentId,
        lesson: { $in: lessonIds },
      }),

      this.examProgressModel.find({
        student: studentId,
        exam: { $in: examIds },
      }),
    ]);

    const lessonProgressMap = new Map(
      lessonProgress.map((progress) => [progress.lesson.toString(), progress]),
    );

    const examProgressMap = new Map(
      examProgress.map((progress) => [progress.exam.toString(), progress]),
    );

    const lessonsData = lessons.map((lesson) => {
      const progress = lessonProgressMap.get(lesson._id.toString());

      return {
        lesson: lesson._id,
        title: lesson.title,
        order: lesson.order,

        videoCompleted: progress?.videoCompleted ?? false,

        explanationCompleted: progress?.explanationCompleted ?? false,

        homeworkCompleted:
          lesson.homework.length === 0
            ? true
            : (progress?.homeworkCompleted ?? false),

        bookCompleted: !lesson.note ? true : (progress?.bookCompleted ?? false),

        videoPoints: progress?.videoPoints ?? 0,

        explanationPoints: progress?.explanationPoints ?? 0,

        homeworkPoints: progress?.homeworkPoints ?? 0,

        totalPoints: progress?.totalPoints ?? 0,

        completed: progress?.completed ?? false,
      };
    });

    const examsData = exams.map((exam) => {
      const progress = examProgressMap.get(exam._id.toString());

      return {
        exam: exam._id,
        title: exam.title,
        order: exam.order,

        correctAnswers: progress?.correctAnswers ?? 0,

        totalQuestions: progress?.totalQuestions ?? exam.examQuestions.length,

        points: progress?.points ?? 0,

        bonusPoints: progress?.bonusPoints ?? 0,

        totalPoints: progress?.totalPoints ?? 0,

        passed: progress?.passed ?? false,
      };
    });

    const lessonPoints = lessonProgress.reduce(
      (total, progress) => total + progress.totalPoints,
      0,
    );

    const examPoints = examProgress.reduce(
      (total, progress) => total + progress.totalPoints,
      0,
    );

    const totalPoints = lessonPoints + examPoints;

    const completedLessons = lessonsData.filter(
      (lesson) => lesson.completed,
    ).length;

    const completedExams = examsData.filter((exam) => exam.passed).length;

    return {
      data: {
        month: monthId,

        lessons: lessonsData,

        exams: examsData,

        summary: {
          totalPoints,
          lessonPoints,
          examPoints,

          totalLessons: lessons.length,
          completedLessons,

          totalExams: exams.length,
          completedExams,
        },
      },
    };
  }

  // ============================================================
  // Helpers
  // ============================================================

  private updateLessonTotalPoints(lessonProgress: LessonProgressDocument) {
    lessonProgress.totalPoints =
      lessonProgress.videoPoints +
      lessonProgress.explanationPoints +
      lessonProgress.homeworkPoints;
  }

  private updateLessonCompletion(
    lesson: LessonDocument,
    lessonProgress: LessonProgressDocument,
  ) {
    const videoCompleted = lessonProgress.videoCompleted;

    const explanationCompleted = lessonProgress.explanationCompleted;

    const homeworkCompleted =
      lesson.homework.length === 0 || lessonProgress.homeworkCompleted;

    const bookCompleted = !lesson.note || lessonProgress.bookCompleted;

    lessonProgress.completed =
      videoCompleted &&
      explanationCompleted &&
      homeworkCompleted &&
      bookCompleted;
  }

  private validateAnswersCount(answers: number[][], questions: IQuestion[]) {
    if (answers.length !== questions.length) {
      throw new BadRequestException("عدد الإجابات لا يطابق عدد الأسئلة");
    }
  }

  private calculateCorrectAnswers(
    questions: IQuestion[],
    answers: number[][],
  ): number {
    let correctAnswers = 0;

    for (let i = 0; i < questions.length; i++) {
      const correct = this.normalizeAnswers(questions[i].correctAnswers);

      const submitted = this.normalizeAnswers(answers[i]);

      if (
        correct.length === submitted.length &&
        correct.every((answer, index) => answer === submitted[index])
      ) {
        correctAnswers++;
      }
    }

    return correctAnswers;
  }

  private normalizeAnswers(answers: number[]): number[] {
    return [...new Set(answers)].sort((a, b) => a - b);
  }
}
