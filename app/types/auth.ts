export type AuthUser = {
  id: string;
  username: string;
  hasPassword: boolean;
  createdAt: string;
  updatedAt: string;
};

export type AuthResponse = {
  token: string;
  user: AuthUser;
};

export type AuthCredentials = {
  username: string;
  password: string;
};
