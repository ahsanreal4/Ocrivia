import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatController } from './chat.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Chat, ChatSchema } from 'src/schemas/chat.schema';
import { UsersModule } from 'src/users/users.module';
import { Message, MessageSchema } from 'src/schemas/message.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { GroqModule } from 'src/groq/groq.module';
import { FileUploadModule } from 'src/file-upload/file-upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Chat.name, schema: ChatSchema }]),
    MongooseModule.forFeature([{ name: Message.name, schema: MessageSchema }]),
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    UsersModule,
    GroqModule,
    FileUploadModule,
  ],
  providers: [ChatService],
  controllers: [ChatController],
})
export class ChatModule {}
