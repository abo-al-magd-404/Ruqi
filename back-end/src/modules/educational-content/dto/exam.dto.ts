import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ContentType } from "../../../common/enums";
import { QuestionDto } from "./question.dto";

export class CreateExamDto {
  @IsEnum([ContentType.EXAM])
  type: ContentType.EXAM;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsMongoId()
  @IsNotEmpty()
  month: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  examQuestions: QuestionDto[];

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passPercentage?: number = 50;
}

export class UpdateExamDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  order?: number;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  examQuestions?: QuestionDto[];

  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  passPercentage?: number;
}
