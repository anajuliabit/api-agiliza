import { Controller, Get } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Scope } from 'src/enums/scope.enum';

@Controller('payments')
export class PaymentsController {
  constructor(private authService: AuthService) {}

  @Get('auth')
  getCredentialsAccessClient(): Promise<string> {
    return this.authService.getCredentialsAccessClient(Scope.PAYMENTS);
  }
}
