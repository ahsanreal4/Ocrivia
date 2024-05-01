import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from 'schemas/chat.schema';
import { Message } from 'schemas/message.schema';
import { User } from 'schemas/user.schema';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { GroqService } from 'src/groq/groq.service';
import { UsersService } from 'src/users/users.service';
import { performOcrRecognition } from 'src/utils/ocrRecognition';
import { Roles } from 'types/roles';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UsersService,
    private groqService: GroqService,
    private fileUploadService: FileUploadService,
  ) {}

  async findOne(id: string): Promise<ChatDocument | undefined> {
    const chat = await this.chatModel
      .findById(id)
      .populate('messages', 'role content', this.messageModel)
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async deleteOne(id: string): Promise<void> {
    const chat = await this.chatModel.findOneAndDelete({ _id: id }).exec();
    await this.messageModel.deleteMany({ _id: { $in: chat.messages } });
  }

  async uploadFile(chatId: string, file: Express.Multer.File) {
    const chat = await this.findOne(chatId);

    await this.fileUploadService.uploadFile(file);

    chat.fileUrl = process.env.COS_CDN_URL + file.originalname;
    const fileContent = await performOcrRecognition(chat.fileUrl);

    const removedLineSpacing = fileContent.split('\n');
    let trimmedString = '';

    removedLineSpacing.forEach((removedLine: string) => {
      trimmedString += removedLine.replace('\r', '') + ' ';
    });

    chat.fileContent = trimmedString;

    await chat.save();

    return trimmedString;
  }

  async getAllUserChats(id: string): Promise<Chat[]> {
    try {
      const user = await this.userModel
        .findById(id)
        .populate('chats', 'name fileUrl fileContent', this.chatModel)
        .exec();

      return user.chats;
    } catch {
      throw new NotFoundException('User not found');
    }
  }

  async createChat(name: string, userId: string): Promise<ChatDocument> {
    const user = await this.usersService.findOneById(userId);

    const createdChat = new this.chatModel({ name });
    await createdChat.save();

    user.chats.push(createdChat);
    await user.save();

    return createdChat;
  }

  async writeUserMessage(chatId: string, content: string) {
    const createdMessage = new this.messageModel({ content, role: Roles.USER });
    await createdMessage.save();

    // Add message id in chat
    const chat = await this.findOne(chatId);
    chat.messages.push(createdMessage);
    await chat.save();

    const populatedChat = (await this.findOne(chat._id.toString())).toJSON();

    const createdMessageObject = {
      role: createdMessage.role,
      content: createdMessage.content,
    };

    const popuplatedChatMessages = [];

    populatedChat.messages.forEach((message: Message) => {
      popuplatedChatMessages.push({
        content: message.content,
        role: message.role,
      });
    });

    const message = await this.groqService.getGroqChatCompletion(
      popuplatedChatMessages,
      createdMessageObject,
      populatedChat.fileContent,
    );

    const messageContent = message && message.content;

    if (typeof messageContent == 'string' && messageContent.length > 0) {
      const assistantMessage = new this.messageModel({
        content: messageContent,
        role: Roles.ASSISTANT,
      });
      await assistantMessage.save();

      chat.messages.push(assistantMessage);
      await chat.save();

      return assistantMessage;
    }

    throw new BadRequestException("AI didn't respond. Please try again");
  }
}
