import { IsOptional, IsString, Matches, MinLength } from "class-validator";

export class UpdateStudentProfileDto {
  @IsString()
  @IsOptional()
  avatar?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @MinLength(8)
  @IsOptional()
  password?: string;

  @IsString()
  @IsOptional()
  @Matches(/^01[0125][0-9]{8}$/, {
    message: "رقم الهاتف يجب أن يكون رقم مصري صحيح",
  })
  phoneNumber?: string;

  @IsString()
  @IsOptional()
  address?: string;
}
