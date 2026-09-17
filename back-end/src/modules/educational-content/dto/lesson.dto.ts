import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";
import { ContentType } from "../../../common/enums";
import { QuestionDto } from "./question.dto";

export class CreateLessonDto {
  @IsEnum([ContentType.LESSON])
  type: ContentType.LESSON;

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

  @IsUrl()
  @IsNotEmpty()
  videoUrl: string;

  @IsString()
  @IsNotEmpty()
  writtenExplanation: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  homework?: QuestionDto[];
}

export class UpdateLessonDto {
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

  @IsUrl()
  @IsOptional()
  videoUrl?: string;

  @IsString()
  @IsOptional()
  writtenExplanation?: string;

  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => QuestionDto)
  homework?: QuestionDto[];

  @IsString()
  @IsOptional()
  note?: string;
}
