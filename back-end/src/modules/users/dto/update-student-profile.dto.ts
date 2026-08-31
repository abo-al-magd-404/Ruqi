import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MinLength,
} from 'class-validator';

export class UpdateStudentProfileDto {
  @IsOptional()
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @Length(3, 100, { message: 'الاسم يجب أن يكون بين 3 و 100 حرف' })
  name?: string;

  @IsOptional()
  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(6, { message: 'كلمة المرور يجب ألا تقل عن 6 أحرف' })
  password?: string;

  @IsOptional()
  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @Matches(/^01[0125]\d{8}$/, {
    message: 'رقم الهاتف يجب أن يكون رقم مصري صالح',
  })
  phoneNumber?: string;

  @IsOptional()
  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  address?: string;

  @IsOptional()
  @IsString({ message: 'المرحلة التعليمية يجب أن تكون نصاً' })
  educationalStage?: string;
}
