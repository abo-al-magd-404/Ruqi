import { NestFactory } from '@nestjs/core';
import { AppModule, ObserveInstrument } from './app.module.js';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
async function bootstrap() {
    const app = await NestFactory.create(AppModule, {
        instrument: ObserveInstrument,
    });
    
    // Configure Cross-Origin Resource Sharing (CORS)
    // 'credentials: true' is required to allow cookies to be sent back and forth
    app.enableCors({
        origin: ['http://localhost:3000', 'domainfrontEndProduction'], 
        methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
        credentials: true, 
    });
    
    app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        transform: true,
        forbidNonWhitelisted: true,
    }));
    app.use(cookieParser());
    await app.listen(process.env.PORT ?? 3000);
}
await bootstrap();
//# sourceMappingURL=main.js.map
