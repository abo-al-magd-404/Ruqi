import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { User, UserDocument } from "../../schemas";
import { UserStatus } from "../enums";

// Validate the access JWT and extract the authenticated user's data
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService,
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("jwt.access.secret"),
    });
  }

  async validate(payload: { sub: string; email: string; role: string }) {
    if (!payload.sub) {
      throw new UnauthorizedException("جلسة غير صالحة");
    }

    const user = await this.userModel.findById(payload.sub).select("status");

    if (!user) {
      throw new UnauthorizedException("المستخدم غير موجود");
    }

    if (user.status === UserStatus.SUSPENDED) {
      throw new UnauthorizedException(
        "تم إيقاف حسابك، يرجى التواصل مع الإدارة",
      );
    }

    return {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
  }
}
