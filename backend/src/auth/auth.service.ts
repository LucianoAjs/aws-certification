import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  createHash,
  randomBytes,
  scryptSync,
  timingSafeEqual,
} from 'node:crypto';
import { PrismaService } from '../database/prisma.service';
import type { User } from '@prisma/client';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  private get prisma() {
    return this.prismaService.client;
  }

  async register(dto: RegisterDto) {
    const email = this.normalizeEmail(dto.email);
    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('Este email ja esta cadastrado.');
    }

    const user = await this.prisma.user.create({
      data: {
        email,
        name: dto.name.trim(),
        passwordHash: this.hashPassword(dto.password),
      },
    });

    return this.createLoginPayload(user);
  }

  async login(dto: LoginDto) {
    const email = this.normalizeEmail(dto.email);
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user || !this.verifyPassword(dto.password, user.passwordHash)) {
      throw new UnauthorizedException('Email ou senha invalidos.');
    }

    return this.createLoginPayload(user);
  }

  async authenticateToken(token: string) {
    const tokenHash = this.hashToken(token);
    const session = await this.prisma.authSession.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!session || session.expiresAt.getTime() <= Date.now()) {
      if (session) {
        await this.prisma.authSession.delete({ where: { id: session.id } });
      }
      throw new UnauthorizedException('Sessao expirada ou invalida.');
    }

    return {
      user: this.toPublicUser(session.user),
      sessionId: session.id,
      tokenHash,
    };
  }

  async logout(tokenHash: string) {
    await this.prisma.authSession.deleteMany({ where: { tokenHash } });
  }

  private async createLoginPayload(user: User) {
    const token = randomBytes(32).toString('base64url');
    const tokenHash = this.hashToken(token);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + this.sessionTtlDays());

    await this.prisma.authSession.create({
      data: {
        tokenHash,
        userId: user.id,
        expiresAt,
      },
    });

    return {
      token,
      user: this.toPublicUser(user),
      expiresAt: expiresAt.toISOString(),
    };
  }

  private normalizeEmail(email: string) {
    return email.trim().toLowerCase();
  }

  private hashPassword(password: string) {
    const salt = randomBytes(16).toString('hex');
    const hash = scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
  }

  private verifyPassword(password: string, storedHash: string) {
    const [salt, hash] = storedHash.split(':');
    if (!salt || !hash) return false;

    const expected = Buffer.from(hash, 'hex');
    const actual = scryptSync(password, salt, 64);
    return expected.length === actual.length && timingSafeEqual(expected, actual);
  }

  private hashToken(token: string) {
    return createHash('sha256').update(token).digest('hex');
  }

  private sessionTtlDays() {
    const parsed = Number(process.env.SESSION_TTL_DAYS ?? 7);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 7;
  }

  private toPublicUser(user: User) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
    };
  }
}
