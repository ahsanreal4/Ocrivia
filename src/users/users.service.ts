import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from 'schemas/user.schema';
import { Model } from 'mongoose';
import { SignUpRequestDto } from 'src/auth/dto/request.dto';
import { SignUpResponseDto } from 'src/auth/dto/response.dto';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(email: string): Promise<UserDocument | undefined> {
    const user: UserDocument = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneById(id: string): Promise<UserDocument | undefined> {
    const user: UserDocument = await this.userModel.findById(id).exec();

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async signUp(
    signUpDto: SignUpRequestDto,
  ): Promise<SignUpResponseDto | undefined> {
    // Check if user is already signed up
    const user = await this.userModel
      .findOne({ email: signUpDto.email })
      .exec();

    if (user) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = new this.userModel(signUpDto);
    await createdUser.save();

    return {
      chats: [],
      email: createdUser.email,
      name: createdUser.name,
      _id: createdUser._id.toString(),
    };
  }
}
