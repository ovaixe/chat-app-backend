import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ChatsModule } from './chats/chats.module';
import { AuthModule } from './auth/auth.module';
import { mongooseCreds } from './config/mongoose';

@Module({
  imports: [ChatsModule, MongooseModule.forRoot(mongooseCreds.URL), AuthModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
