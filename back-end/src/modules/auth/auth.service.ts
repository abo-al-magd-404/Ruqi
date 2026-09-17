import bcrypt from "bcrypt";
import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model, Types } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import {
  ForgetPasswordDto,
  LoginDto,
  RefreshTokenDto,
  ResendOtpDto,
  ResetPasswordDto,
  SignupDto,
  VerifyAccountDto,
} from "./dto";
import {
  EducationalStage,
  EducationalStageDocument,
  User,
  UserDocument,
} from "../../schemas";
import { MailService, TokenService } from "../../common/services";
import { generateOtp, generateStudentId } from "../../common/utils";
import { UserRole, UserStatus } from "../../common/enums";

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(EducationalStage.name)
    private readonly stageModel: Model<EducationalStageDocument>,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly tokenService: TokenService,
    private readonly jwtService: JwtService,
  ) {}

  // 1. Create a new user account
  async signup(signupDto: SignupDto) {
    const { avatar, email, password, name, phoneNumber, address, stage } =
      signupDto;

    const existingUser = await this.userModel.findOne({
      email: email.toLowerCase(),
    });

    if (existingUser) {
      throw new ConflictException("البريد الإلكتروني مُسجل بالفعل");
    }

    let stageObjectId: Types.ObjectId | undefined;

    if (stage) {
      const stageExists = await this.stageModel.findById(stage);

      if (!stageExists) {
        throw new NotFoundException("المرحلة الدراسية المحددة غير موجودة");
      }

      stageObjectId = new Types.ObjectId(stage);
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = generateOtp();

    const otpExpiresInMinutes = this.configService.getOrThrow<number>(
      "emailVerification.otpExpiresIn",
    );

    const now = new Date();

    const otpExpiresAt = new Date(
      now.getTime() + otpExpiresInMinutes * 60 * 1000,
    );

    let studentId = generateStudentId();

    let isStudentIdExists = await this.userModel.findOne({ studentId });

    while (isStudentIdExists) {
      studentId = generateStudentId();
      isStudentIdExists = await this.userModel.findOne({ studentId });
    }

    const newUser = await this.userModel.create({
      studentId,
      avatar,
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      phoneNumber,
      address,
      role: UserRole.STUDENT,
      status: UserStatus.PENDING,
      stage: stageObjectId,
      subscribedMonths: [],
      emailOtp: otp,
      emailOtpExpiresAt: otpExpiresAt,
      emailOtpLastSentAt: now,
    });

    try {
      await this.mailService.sendOtpEmail(newUser.email, otp);
    } catch {
      await this.userModel.deleteOne({ _id: newUser._id });

      throw new InternalServerErrorException(
        "تعذر إرسال رمز التحقق، يرجى المحاولة لاحقًا",
      );
    }

    return {
      message:
        "تم إنشاء الحساب بنجاح، يرجى التوجه للبريد الإلكتروني لتفعيل الحساب بواسطة رمز التحقق",
      email: newUser.email,
    };
  }

  // 2. Resend the signup OTP if it has expired or was not received
  async resendOtp(resendOtpDto: ResendOtpDto) {
    const { email } = resendOtpDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundException("الحساب غير موجود");
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException(
        "الحساب مفعل بالفعل، يمكنك تسجيل الدخول مباشرة",
      );
    }

    const now = new Date();

    const cooldownSeconds = this.configService.getOrThrow<number>(
      "emailVerification.otpResendCooldown",
    );

    if (user.emailOtpLastSentAt) {
      const timeSinceLastSent =
        (now.getTime() - new Date(user.emailOtpLastSentAt).getTime()) / 1000;
      if (timeSinceLastSent < cooldownSeconds) {
        const remainingSeconds = Math.ceil(cooldownSeconds - timeSinceLastSent);
        throw new BadRequestException(
          `يرجى الانتظار ${remainingSeconds} ثانية قبل إعادة طلب رمز التحقق`,
        );
      }
    }

    const otp = generateOtp();
    const otpExpiresInMinutes = this.configService.getOrThrow<number>(
      "emailVerification.otpExpiresIn",
    );
    const otpExpiresAt = new Date(
      now.getTime() + otpExpiresInMinutes * 60 * 1000,
    );

    user.emailOtp = otp;
    user.emailOtpExpiresAt = otpExpiresAt;
    user.emailOtpLastSentAt = now;
    await user.save();

    try {
      await this.mailService.sendOtpEmail(user.email, otp);
    } catch {
      throw new InternalServerErrorException(
        "تعذر إرسال رمز التحقق، يرجى المحاولة لاحقًا",
      );
    }

    return {
      message: "تم إعادة إرسال رمز التحقق بنجاح إلى بريدك الإلكتروني",
    };
  }

  // 3. Verify the user account using the received OTP
  async verifyAccount(verifyAccountDto: VerifyAccountDto) {
    const { email, otp } = verifyAccountDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundException("الحساب غير موجود");
    }

    if (user.status === UserStatus.ACTIVE) {
      throw new BadRequestException(
        "الحساب مفعل بالفعل، يمكنك تسجيل الدخول مباشرة",
      );
    }

    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      throw new BadRequestException(
        "لم يتم طلب رمز تحقق لهذا الحساب أو تم استخدامه من قبل",
      );
    }

    const now = new Date();
    if (now > user.emailOtpExpiresAt) {
      throw new BadRequestException(
        "انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد",
      );
    }

    if (user.emailOtp !== otp) {
      throw new BadRequestException("رمز التحقق غير صحيح");
    }

    user.status = UserStatus.ACTIVE;
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpLastSentAt = null;
    await user.save();

    return {
      message: "تم تفعيل الحساب بنجاح، يمكنك الآن تسجيل الدخول",
    };
  }

  // 4. Authenticate the user and issue access & refresh tokens
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException("لم يتم ايجاد هذا البريد الالكتروني");
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException("كلمة المرور غير صحيحة");
    }

    if (user.status === UserStatus.PENDING) {
      throw new ForbiddenException(
        "الحساب غير مفعل، يرجى تفعيل الحساب أولاً بواسطة رمز التحقق",
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new ForbiddenException(
        "تم تعطيل هذا الحساب، يرجى التواصل مع الدعم الفني",
      );
    }

    const tokens = await this.tokenService.generateAuthTokens({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const hashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);
    user.hashedRefreshToken = hashedRefreshToken;
    await user.save();

    return {
      message: "تم تسجيل الدخول بنجاح",
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        studentId: user.studentId,
      },
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // 5. Reset the user password
  async forgetPassword(forgetPasswordDto: ForgetPasswordDto) {
    const { email } = forgetPasswordDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundException("الحساب غير موجود");
    }

    const now = new Date();
    const cooldownSeconds = this.configService.getOrThrow<number>(
      "emailVerification.otpResendCooldown",
    );

    if (user.emailOtpLastSentAt) {
      const timeSinceLastSent =
        (now.getTime() - new Date(user.emailOtpLastSentAt).getTime()) / 1000;
      if (timeSinceLastSent < cooldownSeconds) {
        const remainingSeconds = Math.ceil(cooldownSeconds - timeSinceLastSent);
        throw new BadRequestException(
          `يرجى الانتظار ${remainingSeconds} ثانية قبل إعادة طلب رمز التحقق`,
        );
      }
    }

    const otp = generateOtp();
    const otpExpiresInMinutes = this.configService.getOrThrow<number>(
      "emailVerification.otpExpiresIn",
    );
    const otpExpiresAt = new Date(
      now.getTime() + otpExpiresInMinutes * 60 * 1000,
    );

    user.emailOtp = otp;
    user.emailOtpExpiresAt = otpExpiresAt;
    user.emailOtpLastSentAt = now;
    await user.save();

    try {
      await this.mailService.sendOtpEmail(user.email, otp);
    } catch {
      throw new InternalServerErrorException(
        "تعذر إرسال رمز التحقق، يرجى المحاولة لاحقًا",
      );
    }

    return {
      message: "تم إرسال رمز إعادة تعيين كلمة المرور إلى بريدك الإلكتروني",
    };
  }

  // 6. Reset the user password using the verified OTP
  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const { email, otp, newPassword } = resetPasswordDto;

    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new NotFoundException("الحساب غير موجود");
    }

    if (!user.emailOtp || !user.emailOtpExpiresAt) {
      throw new BadRequestException(
        "لم يتم طلب رمز إعادة تعيين كلمة المرور لهذا الحساب",
      );
    }

    const now = new Date();
    if (now > user.emailOtpExpiresAt) {
      throw new BadRequestException(
        "انتهت صلاحية رمز التحقق، يرجى طلب رمز جديد",
      );
    }

    if (user.emailOtp !== otp) {
      throw new BadRequestException("رمز التحقق غير صحيح");
    }

    user.password = await bcrypt.hash(newPassword, 10);
    user.emailOtp = null;
    user.emailOtpExpiresAt = null;
    user.emailOtpLastSentAt = null;
    user.hashedRefreshToken = null;
    await user.save();

    return {
      message: "تم تغيير كلمة المرور بنجاح، يمكنك الآن تسجيل الدخول",
    };
  }

  // 7. Generate a new access token using the refresh token
  async getNewAccessToken(refreshTokenDto: RefreshTokenDto) {
    const { refreshToken } = refreshTokenDto;

    let payload: any;

    try {
      const refreshSecret =
        this.configService.getOrThrow<string>("jwt.refresh.secret");

      payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: refreshSecret,
      });
    } catch {
      throw new UnauthorizedException(
        "الـ Refresh Token غير صالح أو انتهت صلاحيته",
      );
    }

    const user = await this.userModel.findById(payload.sub);

    if (!user || !user.hashedRefreshToken) {
      throw new UnauthorizedException(
        "تم إلغاء الجلسة، يرجى تسجيل الدخول مجدداً",
      );
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException(
        "تم إيقاف حسابك، يرجى التواصل مع الإدارة",
      );
    }

    const isRefreshTokenMatching = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );

    if (!isRefreshTokenMatching) {
      throw new UnauthorizedException("الـ Refresh Token غير صالح");
    }

    const tokens = await this.tokenService.generateAuthTokens({
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
    });

    const newHashedRefreshToken = await bcrypt.hash(tokens.refreshToken, 10);

    user.hashedRefreshToken = newHashedRefreshToken;
    await user.save();

    return {
      message: "تم تجديد الـ Access Token بنجاح",
      tokens: {
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
      },
    };
  }

  // 8. Log out the user and invalidate the refresh token
  async logout(userId: string) {
    await this.userModel.findByIdAndUpdate(userId, {
      hashedRefreshToken: null,
    });

    return {
      message: "تم تسجيل الخروج بنجاح",
    };
  }
}
