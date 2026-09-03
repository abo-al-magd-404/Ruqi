import {
  ArrayUnique,
  IsArray,
  IsMongoId,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class UpdateStudentProfileDto {
  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;

  @IsMongoId({ message: 'معرف المرحلة الدراسية غير صالح' })
  @IsOptional()
  stage?: string;

  @IsArray()
  @IsMongoId({ each: true, message: 'معرف الشهر غير صالح' })
  @ArrayUnique()
  @IsOptional()
  subscribedMonths?: string[];
}
