// client/src/types/index.ts
export interface User {
  _id: string;
  name: string;
  mobile: string;
  profilePicture: string;
  status?: string;
}

export interface Message {
  _id: string;
  sender: User;
  content: string;
  createdAt: string;
  readBy: string[];
}

export interface Chat {
  _id: string;
  name?: string;
  isGroup: boolean;
  participants: User[];
  admin?: User;
  picture?: string;
  lastMessage?: Message;
}