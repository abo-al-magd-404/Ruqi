import { IsEmail, IsMongoId, IsOptional, IsString } from 'class-validator';

export class RegisterDto {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  password: string;

  @IsString()
  phoneNumber: string;

  @IsString()
  address: string;

  @IsOptional()
  @IsMongoId()
  educationalStageId?: string;
}
