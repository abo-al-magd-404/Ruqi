import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import configuration from "./config/configuration";
import { envValidationSchema } from "./config";
import { MongooseModule } from "@nestjs/mongoose";
import { User, UserSchema } from "./schemas";
import { AdminModule } from "./modules/admin/admin.module";
import { AuthModule } from "./modules/auth/auth.module";
import { EducationalContentModule } from "./modules/educational-content/educational-content.module";
import { LeaderboardModule } from "./modules/leaderboard/leaderboard.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { UsersModule } from "./modules/users/users.module";
import { UsersSeeder } from "./seeds/users.seeder";

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>("database.mongodbUri"),
      }),
    }),

    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
      },
    ]),

    AdminModule,
    AuthModule,
    EducationalContentModule,
    LeaderboardModule,
    ProgressModule,
    UsersModule,
  ],
  controllers: [],
  providers: [UsersSeeder],
})
export class AppModule {}
