import { IsEnum } from "class-validator";
import { UserStatus } from "../../../common/enums";

export class UpdateStudentStatusDto {
  @IsEnum(UserStatus, {
    message: "حالة الحساب غير صالحة",
  })
  status: UserStatus;
}
