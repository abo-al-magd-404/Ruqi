import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import configuration from "./config/configuration";
import { MongooseModule } from "@nestjs/mongoose";
import { envValidationSchema } from "./config";
import { User, UserSchema } from "./schemas";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { EducationalContentModule } from "./modules/educational-content/educational-content.module";
import { ProgressModule } from "./modules/progress/progress.module";
import { AdminModule } from "./modules/admin/admin.module";
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

    AuthModule,
    UsersModule,
    EducationalContentModule,
    ProgressModule,
    AdminModule,
  ],

  controllers: [],

  providers: [UsersSeeder],
})
export class AppModule {}
