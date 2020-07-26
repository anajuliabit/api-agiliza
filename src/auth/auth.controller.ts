import { Controller, Get, Query } from '@nestjs/common';
import { AuthService } from './auth.service';
import { Token } from 'src/@types/token';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('token')
  authentication(@Query('code') code: string): Promise<Token> {
    return this.authService.getToken(code);
  }
}
