export type UserPublic = {
  id: number;
  email: string;
  name: string;
  age?: number;
  createdAt: string;
};

export type UserRecord = UserPublic & {
  salt: string;
  passwordHash: string;
};

export type SessionRecord = {
  token: string;
  userId: number;
  createdAt: string;
  expiresAt: string;
};
