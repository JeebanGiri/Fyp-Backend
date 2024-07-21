import { Module } from '@nestjs/common';
import { RoomsService } from './rooms.service';
import { RoomsController } from './rooms.controller';
import { FirebaseService } from 'src/firebase/firebase.service';
import { SchedulerRegistry } from '@nestjs/schedule';

@Module({
  controllers: [RoomsController],
  providers: [RoomsService, FirebaseService, SchedulerRegistry],
})
export class RoomsModule {}
