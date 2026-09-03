import { IsString, IsNotEmpty, IsOptional, IsNumber } from 'class-validator';

export class CreateEducationalStageDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateEducationalStageDto {
  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
