import { ConflictException, HttpException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../prisma/prisma.service';
import { GenerateProductKeyDto, SigninDto, SignupDto } from './auth.dto';

@Injectable()
export class AuthService {
  constructor(private readonly prismaService: PrismaService) {}

  async signup(body: SignupDto) {
    const { name, email, phone, password, userType } = body;

    const userExist = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (userExist) {
      throw new ConflictException('Email already exist');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const data = { name, email, phone, password: hashedPassword, userType };
    const user = await this.prismaService.user.create({ data });

    return this.generateJWT({ name: user.name, id: user.id });
  }

  async signin(body: SigninDto) {
    const { email, password } = body;

    const user = await this.prismaService.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new HttpException(`We did not find this email ${email}`, 400);
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);

    if (!isPasswordCorrect) {
      throw new HttpException(`Invalid password`, 400);
    }

    return this.generateJWT({ name: user.name, id: user.id });
  }

  async generateProductKey(body: GenerateProductKeyDto) {
    const { email, userType } = body;
    const hashString = `${email}-${userType}-${process.env.PRODUCT_KEY}`;

    return bcrypt.hash(hashString, 10);
  }

  private async generateJWT(body: any) {
    return jwt.sign(body, process.env.JWT_KEY, { expiresIn: 3600000 });
  }
}
