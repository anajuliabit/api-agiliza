import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';

@Module({
  imports: [AuthModule],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class AppModule {}
