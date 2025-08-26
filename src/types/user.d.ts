// src/types/user.d.ts
export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  profilePicture: string;
  status?: string;
}