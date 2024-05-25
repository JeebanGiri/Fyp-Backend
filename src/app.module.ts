import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { OtpModule } from './otp/otp.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { TypeormConfig } from './@config/typeorm.config';
import { HotelModule } from './hotel/hotel.module';
import { PaymentController } from './payment/payment.controller';
import { PaymentService } from './payment/payment.service';
import { PaymentModule } from './payment/payment.module';
import { RoomsModule } from './rooms/rooms.module';
import { ReservationController } from './reservation/reservation.controller';
import { ReservationService } from './reservation/reservation.service';
import { ReservationModule } from './reservation/reservation.module';
import { ReportsModule } from './reports/reports.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { NotificationService } from './notification/notification.service';
import { NotificationController } from './notification/notification.controller';
import { NotificationModule } from './notification/notification.module';
import { SocketGateway } from './socket/Gateway/socket.gateway';
import { SocketService } from './socket/socket.service';
import { SocketModule } from './socket/socket.module';
import { SuperadminModule } from './superadmin/superadmin.module';
import { HotelAdminController } from './hoteladmin/hoteladmin.controller';
import { HotelAdminService } from './hoteladmin/hoteladmin.service';
import { HotelAdminModule } from './hoteladmin/hoteladmin.module';
import { JwtService } from '@nestjs/jwt';
import { FirebaseModule } from './firebase/firebase.module';
import { CronModule } from './@cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RatingModule } from './rating/rating.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({ useFactory: () => TypeormConfig }),
    ScheduleModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'static'),
      serveRoot: '/static',
    }),
    UsersModule,
    AuthModule,
    OtpModule,
    HotelModule,
    PaymentModule,
    RoomsModule,
    ReservationModule,
    ReportsModule,
    NotificationModule,
    SocketModule,
    SuperadminModule,
    HotelAdminModule,
    FirebaseModule,
    CronModule,
    RatingModule,
  ],
  controllers: [
    AppController,
    PaymentController,
    ReservationController,
    NotificationController,
    HotelAdminController,
  ],
  providers: [
    AppService,
    PaymentService,
    ReservationService,
    NotificationService,
    SocketGateway,
    SocketService,
    HotelAdminService,
    JwtService,
  ],
})
export class AppModule {}
