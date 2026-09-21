import { IsArray } from "class-validator";

export class SubmitAnswersDto {
  @IsArray()
  @IsArray({ each: true })
  answers: number[][];
}
