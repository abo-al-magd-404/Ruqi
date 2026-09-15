import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import {
  EducationalStage,
  EducationalStageDocument,
  Exam,
  ExamDocument,
  Lesson,
  LessonDocument,
  Month,
  MonthDocument,
  User,
  UserDocument,
} from "../../schemas";
import {
  CreateEducationalStageDto,
  CreateMonthDto,
  ReorderDto,
  UpdateEducationalStageDto,
  UpdateMonthDto,
} from "./dto";
import { CreateLessonDto, UpdateLessonDto } from "./dto/lesson.dto";
import { ContentType, UserRole } from "../../common";
import { CreateExamDto, UpdateExamDto } from "./dto/exam.dto";

@Injectable()
export class EducationalContentService {
  constructor(
    @InjectModel(EducationalStage.name)
    private readonly stageModel: Model<EducationalStageDocument>,

    @InjectModel(Month.name)
    private readonly monthModel: Model<MonthDocument>,

    @InjectModel(Lesson.name)
    private readonly lessonModel: Model<LessonDocument>,

    @InjectModel(Exam.name)
    private readonly examModel: Model<ExamDocument>,

    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  // ================================================== //
  // =============== EDUCATIONAL STAGES =============== //
  // ================================================== //

  // Get all educational stages
  async findAllStages(): Promise<EducationalStage[]> {
    return await this.stageModel.find().sort({ order: 1 }).exec();
  }

  // Get one educational stage
  async findOneStage(id: string): Promise<EducationalStage> {
    const stage = await this.stageModel.findById(id).exec();

    if (!stage) {
      throw new NotFoundException("المرحلة الدراسية غير موجودة");
    }

    return stage;
  }

  // Create educational stage
  async createStage(
    createDto: CreateEducationalStageDto,
  ): Promise<EducationalStage> {
    const count = await this.stageModel.countDocuments();

    const newStage = new this.stageModel({
      ...createDto,
      order: createDto.order ?? count,
    });

    return await newStage.save();
  }

  // Update educational stage
  async updateStage(
    id: string,
    updateDto: UpdateEducationalStageDto,
  ): Promise<EducationalStage> {
    const updatedStage = await this.stageModel
      .findByIdAndUpdate(id, updateDto, {
        new: true,
      })
      .exec();

    if (!updatedStage) {
      throw new NotFoundException("المرحلة الدراسية غير موجودة");
    }

    return updatedStage;
  }

  // Reorder educational stages
  async reorderStages(reorderDto: ReorderDto): Promise<void> {
    const bulkOps = reorderDto.items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.id,
        },
        update: {
          $set: {
            order: item.order,
          },
        },
      },
    }));

    await this.stageModel.bulkWrite(bulkOps);
  }

  // Delete educational stage
  async removeStage(id: string): Promise<void> {
    const stage = await this.stageModel.findByIdAndDelete(id).exec();

    if (!stage) {
      throw new NotFoundException("المرحلة الدراسية غير موجودة");
    }

    const months = await this.monthModel
      .find({
        stage: stage._id,
      })
      .select("_id")
      .lean()
      .exec();

    const monthIds = months.map((month) => month._id);

    await Promise.all([
      this.lessonModel.deleteMany({
        month: { $in: monthIds },
      }),

      this.examModel.deleteMany({
        month: { $in: monthIds },
      }),

      this.monthModel.deleteMany({
        stage: stage._id,
      }),
    ]);
  }

  // ================================================== //
  // ================= EDUCATIONAL MONTHS ============== //
  // ================================================== //

  // Create month
  async createMonth(createDto: CreateMonthDto): Promise<Month> {
    const count = await this.monthModel.countDocuments({
      stage: createDto.stage,
    });

    const newMonth = new this.monthModel({
      ...createDto,
      stage: new Types.ObjectId(createDto.stage),
      order: createDto.order ?? count,
    });

    return await newMonth.save();
  }

  // Get all months of a stage.
  async findMonthsByStage(stageId: string, userId?: string) {
    const months = await this.monthModel
      .find({
        stage: new Types.ObjectId(stageId),
      })
      .sort({ order: 1 })
      .lean()
      .exec();

    const access = await this.getMonthAccess(userId);

    return months.map((month) => ({
      ...month,
      locked:
        !access.allMonths && !access.monthIds.includes(month._id.toString()),
    }));
  }

  // Get one month.
  async findOneMonth(id: string, userId?: string) {
    const month = await this.monthModel.findById(id).lean().exec();

    if (!month) {
      throw new NotFoundException("الشهر غير موجود");
    }

    const access = await this.getMonthAccess(userId);

    return {
      ...month,
      locked:
        !access.allMonths && !access.monthIds.includes(month._id.toString()),
    };
  }

  // Update month
  async updateMonth(id: string, updateDto: UpdateMonthDto): Promise<Month> {
    const updateData: Record<string, any> = {
      ...updateDto,
    };

    if (updateDto.stage) {
      updateData.stage = new Types.ObjectId(updateDto.stage);
    }

    const updatedMonth = await this.monthModel
      .findByIdAndUpdate(id, updateData, {
        new: true,
      })
      .exec();

    if (!updatedMonth) {
      throw new NotFoundException("الشهر غير موجود");
    }

    return updatedMonth;
  }

  // Reorder months
  async reorderMonths(reorderDto: ReorderDto): Promise<void> {
    const bulkOps = reorderDto.items.map((item) => ({
      updateOne: {
        filter: {
          _id: item.id,
        },
        update: {
          $set: {
            order: item.order,
          },
        },
      },
    }));

    await this.monthModel.bulkWrite(bulkOps);
  }

  // Delete month
  async removeMonth(id: string): Promise<void> {
    const month = await this.monthModel.findByIdAndDelete(id).exec();

    if (!month) {
      throw new NotFoundException("الشهر غير موجود");
    }

    await Promise.all([
      this.lessonModel.deleteMany({
        month: month._id,
      }),

      this.examModel.deleteMany({
        month: month._id,
      }),
    ]);
  }

  // ================================================== //
  // ===================== LESSONS ==================== //
  // ================================================== //

  // Create lesson
  async createLesson(createDto: CreateLessonDto): Promise<Lesson> {
    const monthId = new Types.ObjectId(createDto.month);

    const [lastLesson, lastExam] = await Promise.all([
      this.lessonModel
        .findOne({ month: monthId })
        .sort({ order: -1 })
        .select("order")
        .lean(),

      this.examModel
        .findOne({ month: monthId })
        .sort({ order: -1 })
        .select("order")
        .lean(),
    ]);

    const lastOrder = Math.max(lastLesson?.order ?? -1, lastExam?.order ?? -1);

    const newLesson = new this.lessonModel({
      ...createDto,
      month: monthId,
      order: createDto.order ?? lastOrder + 1,
      type: ContentType.LESSON,
    });

    return await newLesson.save();
  }

  // Get all lessons of a month.
  async findLessonsByMonth(monthId: string, userId?: string) {
    const lessons = await this.lessonModel
      .find({
        month: new Types.ObjectId(monthId),
      })
      .sort({ order: 1 })
      .lean()
      .exec();

    const access = await this.getMonthAccess(userId);

    const locked = !access.allMonths && !access.monthIds.includes(monthId);

    if (!locked) {
      return lessons.map((lesson) => ({
        ...lesson,
        locked: false,
      }));
    }

    return lessons.map((lesson) => this.toLockedLesson(lesson));
  }

  // Get one lesson.
  async findOneLesson(id: string, userId?: string) {
    const lesson = await this.lessonModel.findById(id).lean().exec();

    if (!lesson) {
      throw new NotFoundException("الدرس غير موجود");
    }

    const access = await this.getMonthAccess(userId);

    const locked =
      !access.allMonths && !access.monthIds.includes(lesson.month.toString());

    if (locked) {
      return this.toLockedLesson(lesson);
    }

    return {
      ...lesson,
      locked: false,
    };
  }

  // Update lesson
  async updateLesson(id: string, updateDto: UpdateLessonDto): Promise<Lesson> {
    const updatedLesson = await this.lessonModel
      .findByIdAndUpdate(id, updateDto, {
        new: true,
      })
      .exec();

    if (!updatedLesson) {
      throw new NotFoundException("الدرس غير موجود");
    }

    return updatedLesson;
  }

  // Delete lesson
  async removeLesson(id: string): Promise<void> {
    const lesson = await this.lessonModel.findByIdAndDelete(id).exec();

    if (!lesson) {
      throw new NotFoundException("الدرس غير موجود");
    }
  }

  // ================================================== //
  // ====================== EXAMS ===================== //
  // ================================================== //

  // Create exam
  async createExam(createDto: CreateExamDto): Promise<Exam> {
    const monthId = new Types.ObjectId(createDto.month);

    const [lastLesson, lastExam] = await Promise.all([
      this.lessonModel
        .findOne({ month: monthId })
        .sort({ order: -1 })
        .select("order")
        .lean(),

      this.examModel
        .findOne({ month: monthId })
        .sort({ order: -1 })
        .select("order")
        .lean(),
    ]);

    const lastOrder = Math.max(lastLesson?.order ?? -1, lastExam?.order ?? -1);

    const newExam = new this.examModel({
      ...createDto,
      month: monthId,
      order: createDto.order ?? lastOrder + 1,
      type: ContentType.EXAM,
    });

    return await newExam.save();
  }

  // Get all exams of a month.
  async findExamsByMonth(monthId: string, userId?: string) {
    const exams = await this.examModel
      .find({
        month: new Types.ObjectId(monthId),
      })
      .sort({ order: 1 })
      .lean()
      .exec();

    const access = await this.getMonthAccess(userId);

    const locked = !access.allMonths && !access.monthIds.includes(monthId);

    if (!locked) {
      return exams.map((exam) => ({
        ...exam,
        locked: false,
      }));
    }

    return exams.map((exam) => this.toLockedExam(exam));
  }

  // Get one exam.
  async findOneExam(id: string, userId?: string) {
    const exam = await this.examModel.findById(id).lean().exec();

    if (!exam) {
      throw new NotFoundException("الاختبار غير موجود");
    }

    const access = await this.getMonthAccess(userId);

    const locked =
      !access.allMonths && !access.monthIds.includes(exam.month.toString());

    if (locked) {
      return this.toLockedExam(exam);
    }

    return {
      ...exam,
      locked: false,
    };
  }

  // Update exam
  async updateExam(id: string, updateDto: UpdateExamDto): Promise<Exam> {
    const updatedExam = await this.examModel
      .findByIdAndUpdate(id, updateDto, {
        new: true,
      })
      .exec();

    if (!updatedExam) {
      throw new NotFoundException("الاختبار غير موجود");
    }

    return updatedExam;
  }

  // Delete exam
  async removeExam(id: string): Promise<void> {
    const exam = await this.examModel.findByIdAndDelete(id).exec();

    if (!exam) {
      throw new NotFoundException("الاختبار غير موجود");
    }
  }

  // ================================================== //
  // ===================== CONTENT ==================== //
  // ================================================== //

  // Get all lessons and exams of a month.
  async findContentByMonth(monthId: string, userId?: string) {
    const objectId = new Types.ObjectId(monthId);

    const [lessons, exams] = await Promise.all([
      this.lessonModel.find({ month: objectId }).lean().exec(),

      this.examModel.find({ month: objectId }).lean().exec(),
    ]);

    const content = [...lessons, ...exams].sort((a, b) => a.order - b.order);

    const access = await this.getMonthAccess(userId);

    const locked = !access.allMonths && !access.monthIds.includes(monthId);

    if (!locked) {
      return {
        locked: false,
        items: content.map((item) => ({
          ...item,
          locked: false,
        })),
      };
    }

    return {
      locked: true,
      items: content.map((item) =>
        item.type === ContentType.LESSON
          ? this.toLockedLesson(item)
          : this.toLockedExam(item),
      ),
    };
  }

  // Reorder lessons and exams using shared order.
  async reorderContent(reorderDto: ReorderDto): Promise<void> {
    const items = reorderDto.items;

    const ids = items.map((item) => item.id);

    if (new Set(ids).size !== ids.length) {
      throw new BadRequestException(
        "لا يمكن تكرار نفس المحتوى في طلب إعادة الترتيب",
      );
    }

    const orders = items.map((item) => item.order);

    if (new Set(orders).size !== orders.length) {
      throw new BadRequestException("لا يمكن تكرار ترتيب المحتوى");
    }

    const objectIds = ids.map((id) => new Types.ObjectId(id));

    const [lessons, exams] = await Promise.all([
      this.lessonModel
        .find({
          _id: { $in: objectIds },
        })
        .select("_id month")
        .lean()
        .exec(),

      this.examModel
        .find({
          _id: { $in: objectIds },
        })
        .select("_id month")
        .lean()
        .exec(),
    ]);

    const contents = [...lessons, ...exams];

    if (contents.length !== items.length) {
      throw new NotFoundException(
        "واحد أو أكثر من المحتوى المطلوب إعادة ترتيبه غير موجود",
      );
    }

    const monthIds = new Set(
      contents.map((content) => content.month.toString()),
    );

    if (monthIds.size !== 1) {
      throw new BadRequestException(
        "يجب أن تكون جميع عناصر المحتوى تابعة لنفس الشهر",
      );
    }

    const lessonIds = new Set(lessons.map((lesson) => lesson._id.toString()));

    const examIds = new Set(exams.map((exam) => exam._id.toString()));

    const lessonOps = items
      .filter((item) => lessonIds.has(item.id))
      .map((item) => ({
        updateOne: {
          filter: {
            _id: new Types.ObjectId(item.id),
          },
          update: {
            $set: {
              order: item.order,
            },
          },
        },
      }));

    const examOps = items
      .filter((item) => examIds.has(item.id))
      .map((item) => ({
        updateOne: {
          filter: {
            _id: new Types.ObjectId(item.id),
          },
          update: {
            $set: {
              order: item.order,
            },
          },
        },
      }));

    await Promise.all([
      lessonOps.length > 0
        ? this.lessonModel.bulkWrite(lessonOps)
        : Promise.resolve(),

      examOps.length > 0
        ? this.examModel.bulkWrite(examOps)
        : Promise.resolve(),
    ]);
  }

  // ================================================== //
  // ===================== STATS ====================== //
  // ================================================== //

  // Get educational content statistics
  async getStats() {
    const [stagesCount, monthsCount, lessonsCount, examsCount] =
      await Promise.all([
        this.stageModel.countDocuments(),

        this.monthModel.countDocuments(),

        this.lessonModel.countDocuments({
          type: ContentType.LESSON,
        }),

        this.examModel.countDocuments({
          type: ContentType.EXAM,
        }),
      ]);

    return {
      stages: stagesCount,
      months: monthsCount,
      lessons: lessonsCount,
      exams: examsCount,
    };
  }

  // ================================================== //
  // ================= ACCESS CONTROL ================== //
  // ================================================== //

  private async getMonthAccess(userId?: string): Promise<{
    allMonths: boolean;
    monthIds: string[];
  }> {
    // Guest
    if (!userId) {
      return {
        allMonths: false,
        monthIds: [],
      };
    }

    const user = await this.userModel
      .findById(userId)
      .select("role subscribedMonths")
      .lean()
      .exec();

    if (!user) {
      throw new NotFoundException("المستخدم غير موجود");
    }

    if (user.role === UserRole.TEACHER || user.role === UserRole.ADMIN) {
      return {
        allMonths: true,
        monthIds: [],
      };
    }

    return {
      allMonths: false,
      monthIds: (user.subscribedMonths ?? []).map((monthId) =>
        monthId.toString(),
      ),
    };
  }

  // ================================================== //
  // ================= LOCKED CONTENT ================= //
  // ================================================== //

  private toLockedLesson(lesson: Lesson) {
    return {
      _id: lesson._id,
      type: lesson.type,
      title: lesson.title,
      description: lesson.description,
      image: lesson.image,
      month: lesson.month,
      order: lesson.order,
      locked: true,
    };
  }

  private toLockedExam(exam: Exam) {
    return {
      _id: exam._id,
      type: exam.type,
      title: exam.title,
      description: exam.description,
      image: exam.image,
      month: exam.month,
      order: exam.order,
      locked: true,
    };
  }
}
