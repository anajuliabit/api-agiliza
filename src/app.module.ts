import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { PaymentsModule } from './payments/payments.module';

@Module({
  imports: [
    ConfigModule.forRoot({ envFilePath: process.cwd() + '/config/.env' }),
    AuthModule,
    AccountsModule,
    PaymentsModule,
  ],
})
export class AppModule {}
