import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'الاسم يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  name!: string;

  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  @IsNotEmpty({ message: 'البريد الإلكتروني مطلوب' })
  email!: string;

  @IsString({ message: 'كلمة المرور يجب أن تكون نصاً' })
  @MinLength(8, { message: 'كلمة المرور يجب ألا تقل عن 8 أحرف' })
  @IsNotEmpty({ message: 'كلمة المرور مطلوبة' })
  password!: string;

  @IsString({ message: 'رقم الهاتف يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'رقم الهاتف مطلوب' })
  phoneNumber!: string;

  @IsString({ message: 'العنوان يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  address!: string;
}
