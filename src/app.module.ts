import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HomeModule } from './home/home.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [UserModule, HomeModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
