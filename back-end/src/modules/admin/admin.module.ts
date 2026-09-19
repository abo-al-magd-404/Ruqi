import { Module } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { MongooseModule } from "@nestjs/mongoose";
import {
  EducationalStage,
  EducationalStageSchema,
  Month,
  MonthSchema,
  User,
  UserSchema,
} from "../../schemas";
import { AdminController } from "./admin.controller";

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
      {
        name: Month.name,
        schema: MonthSchema,
      },
      {
        name: EducationalStage.name,
        schema: EducationalStageSchema,
      },
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
})
export class AdminModule {}
