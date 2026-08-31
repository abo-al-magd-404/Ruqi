import { Module } from '@nestjs/common';
import { createObserveModule } from '@nestjs/observe';
import configuration from './config/configuration.js';
import { envValidationSchema } from './config/validation.js';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module.js';

export const { ObserveModule, ObserveInstrument } = createObserveModule();

@Module({
  imports: [
    // ObserveModule.forRoot({
    //   appKey: 'YOUR_APP_KEY',
    //   appSecret: 'YOUR_APP_SECRET',
    //   serviceId: 'back-end',
    // }),

    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema: envValidationSchema,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.mongodbUri'),
      }),
    }),

    AuthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
