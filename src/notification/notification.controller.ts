import {
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { NotificationService } from './notification.service';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { GetUser } from 'src/@decorators/getUser.decorator';
import { PaginationQuery } from 'src/users/dto/user.dto';

@ApiTags('Notification')
@Controller('notification')
@ApiBearerAuth('JWT-auth')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}

  // ------------GET MY NOTIFICATION--------------
  @Get()
  @ApiOperation({ summary: 'Get My Notification', description: 'UserRole.All' })
  @UseGuards(JwtAuthGuard)
  getAllnotification( 
    @GetUser('id') id: string,
    @Query() options: PaginationQuery,
  ) {
    return this.notificationService.getMyNotification(id, options);
  }

  // ---------- DELETE NOTIFICATION ----------

  @Delete(':id')
  @ApiOperation({ summary: 'Delete Notification', description: 'UserRole.All' })
  @UseGuards(JwtAuthGuard)
  deleteNotification(
    @GetUser('id') user_id: string,
    @Param('id', ParseUUIDPipe) id: string,
  ) {
    return this.notificationService.deleteNotification(user_id, id);
  }
}
