import { IsArray, IsInt, Min } from "class-validator";

export class SubmitAnswersDto {
  @IsArray()
  @IsArray({ each: true })
  answers: number[][];
}
