import { Global, Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import {
  EducationalStage,
  EducationalStageSchema,
  User,
  UserSchema,
} from "../../schemas";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { MailService, TokenService } from "../../common/services";
import { JwtStrategy } from "../../common/strategies";

@Global()
@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: EducationalStage.name, schema: EducationalStageSchema },
    ]),
    JwtModule.register({}),
    PassportModule.register({ defaultStrategy: "jwt" }),
  ],
  controllers: [AuthController],
  providers: [AuthService, MailService, TokenService, JwtStrategy],
  exports: [AuthService, PassportModule, JwtModule],
})
export class AuthModule {}
