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
  media?: {
    url: string;
    type: 'image' | 'video' | 'audio' | 'document';
    name: string;
    size: number;
  }[];
  chat: string;
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