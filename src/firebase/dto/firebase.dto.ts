export class CreateFirebaseDto {}
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsBooleanString, IsOptional } from 'class-validator';
import { NotificationDeviceType } from '../entities/firebase-notification-token.entity';

export class CreateFirebaseNotificationTokenDto {
  @ApiProperty({ example: 'token' })
  @IsString()
  notification_token: string;

  @ApiProperty({ example: NotificationDeviceType.ANDROID, enum: NotificationDeviceType })
  @IsEnum(NotificationDeviceType)
  device_type: NotificationDeviceType;
}

export class UpdateFirebaseNotificationTokenDto {
  @ApiPropertyOptional({ example: 'token' })
  @IsString()
  @IsOptional()
  notification_token: string;

  @ApiPropertyOptional({ example: NotificationDeviceType.ANDROID, enum: NotificationDeviceType })
  @IsEnum(NotificationDeviceType)
  @IsOptional()
  device_type: NotificationDeviceType;

  @ApiPropertyOptional({ example: true })
  @IsBooleanString()
  @IsOptional()
  is_active: boolean;
}
