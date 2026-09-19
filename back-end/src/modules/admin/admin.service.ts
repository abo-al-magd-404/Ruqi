import bcrypt from "bcrypt";
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";

import {
  UpdateStudentDto,
  UpdateStudentStatusDto,
  UpdateSubscribedMonthsDto,
} from "./dto";
import {
  EducationalStage,
  EducationalStageDocument,
  Month,
  MonthDocument,
  User,
  UserDocument,
} from "../../schemas";
import { UserRole } from "../../common/enums";

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,

    @InjectModel(Month.name)
    private readonly monthModel: Model<MonthDocument>,

    @InjectModel(EducationalStage.name)
    private readonly educationalStageModel: Model<EducationalStageDocument>,
  ) {}

  // 1. Retrieve all students
  async getStudents() {
    const students = await this.userModel
      .find({ role: UserRole.STUDENT })
      .select(
        "-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt",
      )
      .populate("stage", "title")
      .populate("subscribedMonths", "title description price order")
      .sort({ createdAt: -1 })
      .lean();

    return {
      message: "تم جلب بيانات الطلاب بنجاح",
      students,
    };
  }

  // 2. Retrieve a student by studentId
  async getStudentByStudentId(studentId: string) {
    const student = await this.userModel
      .findOne({
        studentId,
        role: UserRole.STUDENT,
      })
      .select(
        "-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt",
      )
      .populate("stage", "title")
      .populate("subscribedMonths", "title description price order")
      .lean();

    if (!student) {
      throw new NotFoundException("الطالب غير موجود");
    }

    return {
      message: "تم جلب بيانات الطالب بنجاح",
      student,
    };
  }

  // 3. Update student information
  async updateStudent(studentId: string, updateStudentDto: UpdateStudentDto) {
    const existingStudent = await this.userModel.findOne({
      studentId,
      role: UserRole.STUDENT,
    });

    if (!existingStudent) {
      throw new NotFoundException("الطالب غير موجود");
    }

    const updateData: Record<string, any> = {
      ...updateStudentDto,
    };

    if (updateData.stage) {
      if (!Types.ObjectId.isValid(updateData.stage)) {
        throw new BadRequestException("معرف المرحلة الدراسية غير صالح");
      }

      const stageExists = await this.educationalStageModel.exists({
        _id: updateData.stage,
      });

      if (!stageExists) {
        throw new NotFoundException("المرحلة الدراسية غير موجودة");
      }

      updateData.stage = new Types.ObjectId(updateData.stage);
    }

    if (updateData.password) {
      updateData.password = await bcrypt.hash(updateData.password, 10);
    }

    const updatedStudent = await this.userModel
      .findOneAndUpdate(
        {
          studentId,
          role: UserRole.STUDENT,
        },
        {
          $set: updateData,
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .select(
        "-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt",
      )
      .populate("stage", "title")
      .populate("subscribedMonths", "title description price order")
      .lean();

    return {
      message: "تم تحديث بيانات الطالب بنجاح",
      student: updatedStudent,
    };
  }

  // 4. Update student account status
  async updateStudentStatus(
    studentId: string,
    updateStudentStatusDto: UpdateStudentStatusDto,
  ) {
    const existingStudent = await this.userModel.findOne({
      studentId,
      role: UserRole.STUDENT,
    });

    if (!existingStudent) {
      throw new NotFoundException("الطالب غير موجود");
    }

    const updatedStudent = await this.userModel
      .findOneAndUpdate(
        {
          studentId,
          role: UserRole.STUDENT,
        },
        {
          $set: {
            status: updateStudentStatusDto.status,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .select(
        "-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt",
      )
      .lean();

    return {
      message: "تم تحديث حالة حساب الطالب بنجاح",
      student: updatedStudent,
    };
  }

  // 5. Retrieve student's subscribed months
  async getSubscribedMonths(studentId: string) {
    const student = await this.userModel
      .findOne({
        studentId,
        role: UserRole.STUDENT,
      })
      .select("studentId name subscribedMonths")
      .populate("subscribedMonths", "title description price stage order")
      .lean();

    if (!student) {
      throw new NotFoundException("الطالب غير موجود");
    }

    return {
      message: "تم جلب الأشهر المشترك بها الطالب بنجاح",
      student,
    };
  }

  // 6. Add a month to student's subscriptions
  async addSubscribedMonth(
    studentId: string,
    updateSubscribedMonthsDto: UpdateSubscribedMonthsDto,
  ) {
    const { monthId } = updateSubscribedMonthsDto;

    if (!Types.ObjectId.isValid(monthId)) {
      throw new BadRequestException("معرف الشهر غير صالح");
    }

    const student = await this.userModel.findOne({
      studentId,
      role: UserRole.STUDENT,
    });

    if (!student) {
      throw new NotFoundException("الطالب غير موجود");
    }

    if (!student.stage) {
      throw new BadRequestException("الطالب غير مرتبط بمرحلة دراسية");
    }

    const month = await this.monthModel.findById(monthId);

    if (!month) {
      throw new NotFoundException("الشهر غير موجود");
    }

    if (!month.stage.equals(student.stage)) {
      throw new BadRequestException(
        "لا يمكن إضافة شهر من مرحلة دراسية مختلفة عن مرحلة الطالب",
      );
    }

    const isAlreadySubscribed = student.subscribedMonths.some(
      (subscribedMonth) => subscribedMonth.equals(month._id),
    );

    if (isAlreadySubscribed) {
      throw new ConflictException("الطالب مشترك بالفعل في هذا الشهر");
    }

    const updatedStudent = await this.userModel
      .findOneAndUpdate(
        {
          studentId,
          role: UserRole.STUDENT,
        },
        {
          $addToSet: {
            subscribedMonths: month._id,
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .select(
        "-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt",
      )
      .populate("stage", "title")
      .populate("subscribedMonths", "title description price order")
      .lean();

    return {
      message: "تم إضافة الشهر إلى اشتراكات الطالب بنجاح",
      student: updatedStudent,
    };
  }

  // 7. Remove a month from student's subscriptions
  async removeSubscribedMonth(studentId: string, monthId: string) {
    if (!Types.ObjectId.isValid(monthId)) {
      throw new BadRequestException("معرف الشهر غير صالح");
    }

    const student = await this.userModel.findOne({
      studentId,
      role: UserRole.STUDENT,
    });

    if (!student) {
      throw new NotFoundException("الطالب غير موجود");
    }

    const isSubscribed = student.subscribedMonths.some((subscribedMonth) =>
      subscribedMonth.equals(monthId),
    );

    if (!isSubscribed) {
      throw new NotFoundException("هذا الشهر غير موجود ضمن اشتراكات الطالب");
    }

    const updatedStudent = await this.userModel
      .findOneAndUpdate(
        {
          studentId,
          role: UserRole.STUDENT,
        },
        {
          $pull: {
            subscribedMonths: new Types.ObjectId(monthId),
          },
        },
        {
          returnDocument: "after",
          runValidators: true,
        },
      )
      .select(
        "-password -hashedRefreshToken -emailOtp -emailOtpExpiresAt -emailOtpLastSentAt",
      )
      .populate("stage", "title")
      .populate("subscribedMonths", "title description price order")
      .lean();

    return {
      message: "تم حذف الشهر من اشتراكات الطالب بنجاح",
      student: updatedStudent,
    };
  }

  // 8. Delete student account
  async deleteStudent(studentId: string) {
    const student = await this.userModel.findOne({
      studentId,
      role: UserRole.STUDENT,
    });

    if (!student) {
      throw new NotFoundException("الطالب غير موجود");
    }

    await this.userModel.deleteOne({
      _id: student._id,
      role: UserRole.STUDENT,
    });

    return {
      message: "تم حذف حساب الطالب بنجاح",
    };
  }
}
