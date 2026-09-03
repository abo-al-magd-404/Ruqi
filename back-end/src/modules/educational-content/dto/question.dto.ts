import {
  IsArray,
  IsInt,
  IsNotEmpty,
  IsString,
  ArrayMinSize,
} from 'class-validator';

export class QuestionDto {
  @IsString()
  @IsNotEmpty()
  questionText: string;

  @IsArray()
  @IsString({ each: true })
  @ArrayMinSize(2)
  options: string[];

  @IsArray()
  @IsInt({ each: true })
  @ArrayMinSize(1)
  correctAnswers: number[];
}
