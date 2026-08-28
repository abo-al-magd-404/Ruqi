import { IsMongoId, IsString, Length } from 'class-validator';

export class VerifyEmailDto {
  @IsMongoId()
  userId: string;

  @IsString()
  @Length(6, 6)
  otp: string;
}
