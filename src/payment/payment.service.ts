import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreatePaymentDto } from './dto/payment.dto';
import { User } from 'src/users/entities/user.entity';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentService {
  constructor(private readonly dataSource: DataSource) {}

  //------------CREATE PAYMENT--------------
  async makePayment(loggedUser: User, payload: CreatePaymentDto) {
    console.log(loggedUser);
    console.log(payload);
  }

  async getTotalPrice() {
    return await this.dataSource.getRepository(Payment).find();
  }
}
