import { Module } from '@nestjs/common';
import { SuperadminService } from './superadmin.service';
import { SuperadminController } from './superadmin.controller';
import { FirebaseService } from 'src/firebase/firebase.service';

@Module({
  providers: [SuperadminService,FirebaseService],
  controllers: [SuperadminController]
})
export class SuperadminModule {}
