import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [PaymentsController],
})
export class PaymentsModule {}
