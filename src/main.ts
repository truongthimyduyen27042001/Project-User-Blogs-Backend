import * as dotenv from 'dotenv';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

// Load .env file manually BEFORE creating the app
const envPath = join(process.cwd(), '.env');
console.log('🔍 Loading .env from:', envPath);
dotenv.config({ path: envPath });

async function bootstrap() {
  console.log("🔍 Starting application...");
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: "http://localhost:5173",
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application is running on: http://localhost:${port}`);
}
bootstrap();
