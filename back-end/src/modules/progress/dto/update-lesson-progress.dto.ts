import { IsEnum } from "class-validator";
import { LessonProgressType } from "../../../common/enums";

export class UpdateLessonProgressDto {
  @IsEnum(LessonProgressType)
  type: LessonProgressType;
}
