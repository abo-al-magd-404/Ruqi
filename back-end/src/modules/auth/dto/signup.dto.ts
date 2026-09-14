import {
  IsEmail,
  IsMongoId,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from "class-validator";

export class SignupDto {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @Matches(/^01[0125][0-9]{8}$/, {
    message: "رقم الهاتف يجب أن يكون رقم مصري صحيح",
  })
  phoneNumber!: string;

  @IsString()
  @IsNotEmpty()
  address!: string;

  @IsOptional()
  @IsMongoId({ message: "معرف المرحلة الدراسية غير صالح" })
  stage?: string;
}
