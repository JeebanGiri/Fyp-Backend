import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsString, IsUUID } from 'class-validator';
import { NotificationType } from '../entities/notification.entity';

export class CreateNotificationDto {
  @ApiProperty({ example: 'Order placed' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'We have placed your order' })
  @IsString()
  body: string;

  @ApiProperty({
    type: 'enum',
    example: 'ORDER_CUSTOMER',
    enum: NotificationType,
  })
  @IsEnum(NotificationType)
  notification_type: NotificationType;

  @ApiProperty({ example: 'b2866d6f-2705-49b3-aa28-f71fa265c11f' })
  @IsUUID()
  user_id: string;
}
