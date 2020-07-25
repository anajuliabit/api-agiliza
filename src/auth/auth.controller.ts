import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  getCredentialsAcessClient(): Promise<string> {
    return this.authService.getCredentialsAccessClient();
  }

  @Get('token')
  authentication(@Query('code') code: string) {
    return this.authService.getToken(code);
  }
}
