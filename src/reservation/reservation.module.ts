import { Module } from '@nestjs/common';
import { ReservationController } from './reservation.controller';
import { ReservationService } from './reservation.service';
import Stripe from 'stripe';

@Module({
  controllers: [ReservationController],
  providers: [ReservationService, Stripe],
})
export class ReservationModule {}
