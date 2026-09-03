import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  EducationalStage,
  EducationalStageDocument,
} from '../../schemas/educational-stage.schema.js';
import { Model, Types } from 'mongoose';
import {
  CreateEducationalStageDto,
  UpdateEducationalStageDto,
} from './dto/educational-stage.dto.js';
import { ReorderDto } from './dto/reorder.dto.js';
import { Month, MonthDocument } from '../../schemas/month.schema.js';
import {
  LessonExam,
  LessonExamDocument,
} from '../../schemas/lesson-exam.schema.js';
import { CreateMonthDto, UpdateMonthDto } from './dto/month.dto.js';
import {
  CreateExamDto,
  CreateLessonDto,
  UpdateLessonExamDto,
} from './dto/lesson-exam.dto.js';

@Injectable()
export class EducationalContentService {
  constructor(
    @InjectModel(EducationalStage.name)
    private readonly stageModel: Model<EducationalStageDocument>,
    @InjectModel(Month.name)
    private readonly monthModel: Model<MonthDocument>,
    @InjectModel(LessonExam.name)
    private readonly lessonExamModel: Model<LessonExamDocument>,
  ) {}

  // ================================================== //
  // =============== EDUCATIONAL STAGES =============== //
  // ================================================== //

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

  async findAllStages(): Promise<EducationalStage[]> {
    return await this.stageModel.find().sort({ order: 1 }).exec();
  }

  async findOneStage(id: string): Promise<EducationalStage> {
    const stage = await this.stageModel.findById(id).exec();
    if (!stage) {
      throw new NotFoundException('المرحلة الدراسية غير موجودة');
    }
    return stage;
  }

  async updateStage(
    id: string,
    updateDto: UpdateEducationalStageDto,
  ): Promise<EducationalStage> {
    const updatedStage = await this.stageModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();
    if (!updatedStage) {
      throw new NotFoundException('المرحلة الدراسية غير موجودة');
    }
    return updatedStage;
  }

  async reorderStages(reorderDto: ReorderDto): Promise<void> {
    const bulkOps = reorderDto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    await this.stageModel.bulkWrite(bulkOps);
  }

  async removeStage(id: string): Promise<void> {
    const result = await this.stageModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('المرحلة الدراسية غير موجودة');
    }

    const months = await this.monthModel
      .find({ stage: result._id })
      .select('_id')
      .lean();

    const monthIds = months.map((month) => month._id);
    await this.lessonExamModel.deleteMany({ month: { $in: monthIds } });
    await this.monthModel.deleteMany({ stage: result._id });
  }

  // ================================================== //
  // =============== EDUCATIONAL MONTHS =============== //
  // ================================================== //

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

  async findMonthsByStage(stageId: string): Promise<Month[]> {
    return await this.monthModel
      .find({ stage: new Types.ObjectId(stageId) })
      .sort({ order: 1 })
      .exec();
  }

  async findOneMonth(id: string): Promise<Month> {
    const month = await this.monthModel.findById(id).exec();
    if (!month) {
      throw new NotFoundException('الشهر غير موجود');
    }
    return month;
  }

  async updateMonth(id: string, updateDto: UpdateMonthDto): Promise<Month> {
    const updateData: Record<string, any> = { ...updateDto };
    if (updateDto.stage) {
      updateData.stage = new Types.ObjectId(updateDto.stage);
    }

    const updatedMonth = await this.monthModel
      .findByIdAndUpdate(id, updateData, { new: true })
      .exec();

    if (!updatedMonth) {
      throw new NotFoundException('الشهر غير موجود');
    }
    return updatedMonth;
  }

  async reorderMonths(reorderDto: ReorderDto): Promise<void> {
    const bulkOps = reorderDto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    await this.monthModel.bulkWrite(bulkOps);
  }

  async removeMonth(id: string): Promise<void> {
    const result = await this.monthModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('الشهر غير موجود');
    }

    await this.lessonExamModel.deleteMany({ month: result._id });
  }

  // ================================================== //
  // =============== LESSONS AND EXAMS ================ //
  // ================================================== //

  async createLesson(createDto: CreateLessonDto): Promise<LessonExam> {
    const count = await this.lessonExamModel.countDocuments({
      month: createDto.month,
    });
    const newLesson = new this.lessonExamModel({
      ...createDto,
      month: new Types.ObjectId(createDto.month),
      order: createDto.order ?? count,
    });
    return await newLesson.save();
  }

  async createExam(createDto: CreateExamDto): Promise<LessonExam> {
    const count = await this.lessonExamModel.countDocuments({
      month: createDto.month,
    });
    const newExam = new this.lessonExamModel({
      ...createDto,
      month: new Types.ObjectId(createDto.month),
      order: createDto.order ?? count,
    });
    return await newExam.save();
  }

  async findContentByMonth(monthId: string): Promise<LessonExam[]> {
    return await this.lessonExamModel
      .find({ month: new Types.ObjectId(monthId) })
      .sort({ order: 1 })
      .exec();
  }

  async findOneContent(id: string): Promise<LessonExam> {
    const item = await this.lessonExamModel.findById(id).exec();
    if (!item) {
      throw new NotFoundException('المحتوى المطلوب غير موجود');
    }
    return item;
  }

  async updateContent(
    id: string,
    updateDto: UpdateLessonExamDto,
  ): Promise<LessonExam> {
    const updated = await this.lessonExamModel
      .findByIdAndUpdate(id, updateDto, { new: true })
      .exec();

    if (!updated) {
      throw new NotFoundException('المحتوى المطلوب غير موجود');
    }
    return updated;
  }

  async reorderContent(reorderDto: ReorderDto): Promise<void> {
    const bulkOps = reorderDto.items.map((item) => ({
      updateOne: {
        filter: { _id: item.id },
        update: { $set: { order: item.order } },
      },
    }));
    await this.lessonExamModel.bulkWrite(bulkOps);
  }

  async removeContent(id: string): Promise<void> {
    const result = await this.lessonExamModel.findByIdAndDelete(id).exec();
    if (!result) {
      throw new NotFoundException('المحتوى المطلوب غير موجود');
    }
  }
}
