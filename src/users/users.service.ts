import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './schemas/user.schema';
import * as bcrypt from 'bcrypt';
import { Logger } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private logger = new Logger('UsersService');

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
        throw new Error('User not found with this username!');
      }
    } catch (err) {
      this.logger.error('[findOne]: ' + err.message);
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
      return await user.save();
    } catch (err) {
      this.logger.error('[createOne]: ' + err.message);
      if (err.code === 11000) {
        // Duplicate key error (e.g., unique index violation)
        throw new ConflictException('Username already exists');
      }
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
