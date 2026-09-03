import {
  IsEnum,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { QuestionDto } from './question.dto.js';
import { ContentType } from '../../../common/enums/content-type.enum.js';

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

export class UpdateLessonExamDto {
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
