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
}

export interface Chat {
  _id: string;
  participants: User[];
  lastMessage?: Message;
}