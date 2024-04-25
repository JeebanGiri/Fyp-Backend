import {
  Body,
  Controller,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { FirebaseService } from './firebase.service';
import { ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { GetUser } from 'src/@decorators/getUser.decorator';
import {
  CreateFirebaseNotificationTokenDto,
  UpdateFirebaseNotificationTokenDto,
} from './dto/firebase.dto';

@Controller('firebase')
export class FirebaseController {
  constructor(private readonly firebaseService: FirebaseService) {}

  // ---------- SAVE NEW TOKEN ----------
  @Post('save-token')
  @ApiOperation({ summary: 'Create new token' })
  @UseGuards(JwtAuthGuard)
  createToken(
    @GetUser('id') user_id: string,
    @Body() payload: CreateFirebaseNotificationTokenDto,
  ) {
    console.log(payload.device_type, payload.notification_token, 'Token');
    return this.firebaseService.createToken(user_id, payload);
  }

  // ---------- UPDATE TOKEN ----------
  @Patch('update-token/:token_id')
  @ApiOperation({ summary: 'Update token' })
  @UseGuards(JwtAuthGuard)
  updateToken(
    @GetUser('id') user_id: string,
    @Param('token_id') token_id: string,
    @Body() payload: UpdateFirebaseNotificationTokenDto,
  ) {
    return this.firebaseService.updateToken(user_id, token_id, payload);
  }
  // ---------- DELETE TOKEN ----------
  @Patch('delete-token/:token_id')
  @ApiOperation({ summary: 'Delete token' })
  @UseGuards(JwtAuthGuard)
  deleteToken(
    @GetUser('id') user_id: string,
    @Param('token_id') token_id: string,
  ) {
    return this.firebaseService.deleteToken(user_id, token_id);
  }
}
