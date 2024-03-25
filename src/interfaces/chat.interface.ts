import { UserInterface } from './user.interface';

export interface DirectMessage {
  content: string;
  timeSent: Date;
  fromSelf: boolean;
}

export interface Message {
  userName: string;
  timeSent: Date;
  message: string;
  roomName: string;
}

export interface Room {
  name: string;
  host: UserInterface;
  users: UserInterface[];
}
