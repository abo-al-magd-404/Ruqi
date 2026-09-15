import { IsArray, IsInt, Min } from "class-validator";

export class SubmitAnswersDto {
  @IsArray()
  @IsArray({ each: true })
  @IsInt({ each: true })
  @Min(0, { each: true })
  answers: number[][];
}
