import type { Request } from 'express';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
}

export interface AuthenticatedRequest extends Request {
  user: AuthUser;
  sessionId: string;
  tokenHash: string;
}
