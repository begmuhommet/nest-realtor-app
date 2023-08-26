import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { UserType } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { GenerateProductKeyDto, SigninDto, SignupDto } from './auth.dto';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('/signup')
  async signup(@Body() body: SignupDto) {
    const { email, userType, productKey } = body;

    if (userType === UserType.Admin) {
      throw new BadRequestException(`You can't create an admin`);
    }

    if (userType === UserType.Realtor) {
      if (!productKey) {
        throw new BadRequestException(`No product key provided`);
      }

      const key = `${email}-${userType}-${process.env.PRODUCT_KEY}`;
      const isKeyCorrect = await bcrypt.compare(key, productKey);

      if (!isKeyCorrect) {
        throw new BadRequestException(`Wrong product key`);
      }
    }

    return this.authService.signup(body);
  }

  @Post('/signin')
  signin(@Body() body: SigninDto) {
    return this.authService.signin(body);
  }

  @Post('/product-key')
  generateProductKey(@Body() body: GenerateProductKeyDto) {
    return this.authService.generateProductKey(body);
  }
}
