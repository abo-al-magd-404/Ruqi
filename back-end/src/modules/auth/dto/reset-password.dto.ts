import {
  IsEmail,
  IsNotEmpty,
  IsString,
  Length,
  MinLength,
} from 'class-validator';

export class ResetPasswordDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email!: string;

  @IsString({ message: 'رمز التحقق يجب أن يكون نصاً' })
  @Length(6, 6, { message: 'رمز التحقق يجب أن يتكون من 6 أرقام' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  otp!: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(8, { message: 'كلمة المرور الجديدة يجب ألا تقل عن 8 أحرف' })
  @IsNotEmpty({ message: 'كلمة المرور الجديدة مطلوبة' })
  newPassword!: string;
}
