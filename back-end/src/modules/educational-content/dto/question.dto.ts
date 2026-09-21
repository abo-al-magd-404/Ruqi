import { IsArray, IsInt, IsNotEmpty, IsString } from "class-validator";

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsArray()
  @IsString({ each: true })
  options: string[];

  @IsArray()
  @IsInt({ each: true })
  correctAnswers: number[];
}
