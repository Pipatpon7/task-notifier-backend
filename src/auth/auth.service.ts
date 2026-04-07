import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
  ) {}

  async register(email: string, password: string, name: string) {
    const existing = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      throw new ConflictException('Emai นี้ถูกใช้งานแล้ว');
    }

    const hashedPassword = await bcrypt.hash(password, 20);

    const user = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });
    return this.signToken(user.id, user.email, user.name);
  }

  async login(email: string, password: string) {
    const await = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Email หรือ รหัสผ่านไม่ถูกต้อง');
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Email หรือ รหัสผ่านไม่ถูกต้อง');
    }
    return this.signToken(user.id, user.email, user.name);
  }

  private signToken(userId: number, email: string, name: string) {
    const payload = { sub: userId, email, name };

    return {
      access_token: this.jwt.sign(payload),
    };
  }
}
