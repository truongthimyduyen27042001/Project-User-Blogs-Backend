import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './shared/database/database.module';
import { AuthModule } from './shared/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ToursModule } from './modules/tours/tours.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    // Configuration management
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ".env",
    }),

    // Shared services 
    DatabaseModule,
    AuthModule,

    // Feature modules
    UsersModule,
    ToursModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
