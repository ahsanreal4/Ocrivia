import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { hashSha256 } from '../utils/hashing';
import { SignUpRequestDto } from './dto/request.dto';
import { UserDocument } from '../schemas/user.schema';
import { SignUpResponseDto } from './dto/response.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async signIn(email: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(email);

    if (!user) {
      throw new UnauthorizedException();
    }

    const paramHashedPass = hashSha256(pass, 32);

    if (user.password != paramHashedPass) {
      throw new UnauthorizedException();
    }
    const payload = { sub: user.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async signUp(
    signUpDto: SignUpRequestDto,
  ): Promise<{ access_token: string } | undefined> {
    const hashedPassword = hashSha256(signUpDto.password, 32);

    const userInfo = await this.usersService.signUp({
      email: signUpDto.email,
      name: signUpDto.name,
      password: hashedPassword,
    });

    const payload = { sub: userInfo.email };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async getUserProfile(email: string): Promise<SignUpResponseDto | undefined> {
    const user: UserDocument = await this.usersService.findOne(email);

    return {
      chats: [],
      email: user.email,
      name: user.name,
      _id: user._id.toString(),
    };
  }
}
