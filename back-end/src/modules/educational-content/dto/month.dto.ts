import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsMongoId,
  Min,
} from 'class-validator';

export class CreateMonthDto {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsString()
  @IsOptional()
  image?: string;

  @IsNumber()
  @Min(0)
  price: number;

  @IsMongoId()
  @IsNotEmpty()
  stage: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}

export class UpdateMonthDto {
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
  @Min(0)
  @IsOptional()
  price?: number;

  @IsMongoId()
  @IsOptional()
  stage?: string;

  @IsNumber()
  @IsOptional()
  order?: number;
}
