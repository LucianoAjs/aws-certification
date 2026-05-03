export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthPayload {
  token: string;
  user: AuthUser;
  expiresAt: string;
}
