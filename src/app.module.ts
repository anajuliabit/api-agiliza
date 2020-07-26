import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [AuthModule, AccountsModule, PaymentsModule],
})
export class AppModule {}
