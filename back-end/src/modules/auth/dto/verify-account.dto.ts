import { IsEmail, IsNotEmpty, IsString, Length } from 'class-validator';

export class VerifyAccountDto {
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email!: string;

  @IsString({ message: 'رمز التحقق يجب أن يكون نصاً' })
  @Length(6, 6, { message: 'رمز التحقق يجب أن يتكون من 6 أرقام' })
  @IsNotEmpty({ message: 'رمز التحقق مطلوب' })
  otp!: string;
}
