import { Module } from '@nestjs/common';
import { RatingService } from './rating.service';
import { RatingController } from './rating.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  controllers: [RatingController],
  providers: [RatingService, FirebaseService],
})
export class RatingModule {}
