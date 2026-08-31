import { IsNotEmpty, IsString } from 'class-validator';

export class RefreshTokenDto {
  @IsString({ message: 'الـ Refresh Token يجب أن يكون نصاً' })
  @IsNotEmpty({ message: 'الـ Refresh Token مطلوب' })
  refreshToken!: string;
}
