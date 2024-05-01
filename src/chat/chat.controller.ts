import {
  Controller,
  UseGuards,
  Body,
  Post,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  Delete,
} from '@nestjs/common';
import { AuthGuard } from '../auth/auth.guard';
import { ChatService } from './chat.service';
import { Chat, ChatDocument } from '../schemas/chat.schema';
import { FileInterceptor } from '@nestjs/platform-express';

@UseGuards(AuthGuard)
@Controller('chat')
export class ChatController {
  constructor(private chatService: ChatService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post('/')
  async createChat(@Body() createChatDto: { name: string; userId: string }) {
    return await this.chatService.createChat(
      createChatDto.name,
      createChatDto.userId,
    );
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/message')
  async writeUserMessage(
    @Body() writeUserMessageDto: { content: string; chatId: string },
  ) {
    const { chatId, content } = writeUserMessageDto;
    return await this.chatService.writeUserMessage(chatId, content);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('/:id/file')
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Param('id') id: string,
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!id) throw new BadRequestException('Chat id was not provided');

    return this.chatService.uploadFile(id, file);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/:id')
  async getChatById(@Param('id') id: string): Promise<ChatDocument> {
    return await this.chatService.findOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Delete('/:id')
  async deleteChatById(@Param('id') id: string): Promise<void> {
    await this.chatService.deleteOne(id);
  }

  @HttpCode(HttpStatus.OK)
  @Get('/user/:id')
  async getAllUserChats(@Param('id') id: string): Promise<Chat[]> {
    return await this.chatService.getAllUserChats(id);
  }
}
