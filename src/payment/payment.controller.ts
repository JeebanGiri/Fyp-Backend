import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { GetUser } from 'src/@decorators/getUser.decorator';
import { Roles } from 'src/@decorators/roles.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { CreatePaymentDto } from './dto/payment.dto';
import { PaymentService } from './payment.service';

@Controller('transaction')
export class PaymentController {
  constructor(private readonly paymentService: PaymentService) {}

  // -----------Make Payment---------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer, UserRole.hotel_admin)
  @Post()
  createPayment(@GetUser() user: User, @Body() payload: CreatePaymentDto) {
    return this.paymentService.makePayment(user, payload);
  }

  @Roles(UserRole.super_admin)
  @Get('/get-all')
  getTotalAmount() {
    return this.paymentService.getTotalPrice();
  }
}
