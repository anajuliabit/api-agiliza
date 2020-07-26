import { Controller, Get } from '@nestjs/common';
import { Scope } from '../enums/scope.enum';
import { AuthService } from 'src/auth/auth.service';

@Controller('accounts')
export class AccountsController {
  constructor(private authService: AuthService) {}

  @Get('auth')
  getCredentialsAccessClient(): Promise<string> {
    return this.authService.getCredentialsAccessClient(Scope.ACCOUNTS);
  }
}
