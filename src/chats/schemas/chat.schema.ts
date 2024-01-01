import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type ChatDocument = HydratedDocument<Chat>;

@Schema()
export class Chat {
  @Prop()
  userName: string;

  @Prop()
  message: string;

  @Prop()
  timeSent: Date;

  @Prop()
  roomName: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
