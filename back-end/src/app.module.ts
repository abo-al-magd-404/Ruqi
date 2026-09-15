import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createObserveModule } from "@nestjs/observe";
import configuration from "./config/configuration";
import { envValidationSchema } from "./config";
import { MongooseModule } from "@nestjs/mongoose";
import { AuthModule } from "./modules/auth/auth.module";
import { UsersSeeder } from "./seeds/users.seeder";
import { User, UserSchema } from "./schemas";
import { UsersModule } from "./modules/users/users.module";
import { EducationalContentModule } from "./modules/educational-content/educational-content.module";

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
  ],

  controllers: [],

  providers: [UsersSeeder],
})
export class AppModule {}
