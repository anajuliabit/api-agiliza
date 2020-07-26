import { Controller, Get, Post, Body } from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { Scope } from 'src/enums/scope.enum';
import { Transaction } from './transaction';

@Controller('payments')
export class PaymentsController {
  constructor(private authService: AuthService) {}

  @Post('auth')
  getCredentialsAccessClient(
    @Body('transaction') transaction: Transaction,
  ): Promise<string> {
    return this.authService.getCredentialsAccessClient(
      Scope.PAYMENTS,
      transaction,
    );
  }
}
