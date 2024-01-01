import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  async findOne(username: string): Promise<User> {
    try {
      const userDoc = await this.userModel
        .findOne({ userName: username })
        .exec();
      if (userDoc) {
        const { userName, password } = userDoc;
        const user: User = { userName, password };
        return user;
      } else {
        throw new Error('No user found with this username!');
      }
    } catch (err) {
      console.log('[ERROR][UsersService:findOne]: ', err);
      throw err;
    }
  }

  async createOne(username: string, password: string): Promise<User> {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new this.userModel({
        userName: username,
        password: hashedPassword,
      });
      if (user) {
        return await user.save();
      } else {
        throw new Error('User Not Created!');
      }
    } catch (err) {
      console.log('[ERROR][UsersService:createOne]: ', err);
      throw err;
    }
  }

  async comparePasswords(
    candidatePassword: string,
    hashedPassword: string,
  ): Promise<boolean> {
    return bcrypt.compare(candidatePassword, hashedPassword);
  }
}
