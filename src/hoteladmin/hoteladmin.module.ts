import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HotelAdminService } from './hoteladmin.service';
import { HotelAdminController } from './hoteladmin.controller';
import { OtpService } from 'src/otp/otp.service';
import { HotelAdminDocumentDetails } from './entities/hoteladmin-document-details';
import { HotelAdminPaymentDetails } from './entities/hoteladmin-payment-details';
import { JwtService } from '@nestjs/jwt';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      HotelAdminDocumentDetails,
      HotelAdminPaymentDetails,
    ]),
  ],
  controllers: [HotelAdminController],
  providers: [HotelAdminService, OtpService, JwtService, FirebaseService],
  exports: [HotelAdminService],
})
export class HotelAdminModule {}
