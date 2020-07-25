import { Controller, Get } from '@nestjs/common';
import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get()
  getCredentialsAcessClient() {
    return this.authService.getCredentialsAccessClient();
  }
}
