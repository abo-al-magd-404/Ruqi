import { IsEnum } from "class-validator";
import { LessonProgressType } from "../../../common";

export class UpdateLessonProgressDto {
  @IsEnum(LessonProgressType)
  type: LessonProgressType;
}
