import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Chat, ChatDocument } from 'schemas/chat.schema';
import { Message } from 'schemas/message.schema';
import { User } from 'schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { Roles } from 'types/roles';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Chat.name) private chatModel: Model<Chat>,
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
    private usersService: UsersService,
  ) {}

  async findOne(id: string): Promise<ChatDocument | undefined> {
    const chat = await this.chatModel
      .findById(id)
      .populate('messages', '', this.messageModel)
      .exec();

    if (!chat) {
      throw new NotFoundException('Chat not found');
    }

    return chat;
  }

  async getAllUserChats(id: string): Promise<Chat[]> {
    try {
      const user = await this.userModel
        .findById(id)
        .populate('chats', 'name', this.chatModel)
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

    return createdMessage;
  }
}
