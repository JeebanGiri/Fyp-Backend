import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  IsUUID,
  MaxLength,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { ReservationStatus } from '../entities/reservation.entity';

export class CreateReservationDto {
  @ApiProperty({ example: 'Jeeban G' })
  @IsString()
  @IsNotEmpty()
  full_name: string;

  @ApiProperty({ example: 'jeebang@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ example: 'jeebang@gmail.com' })
  @IsString()
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  confirm_email: string;

  @ApiPropertyOptional({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ example: 'Nepal' })
  @IsString()
  country: string;

  @ApiProperty({ example: 'I need this table for birthday party' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @IsOptional()
  note: string;

  @ApiPropertyOptional({ example: 'Late Reply' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cancel_reason?: string;
}

export class UpdateReservationDto {
  @ApiPropertyOptional({ example: '2023-7-11 01:30:00' })
  @IsDateString()
  @IsOptional()
  start_time: Date;

  @ApiPropertyOptional({ example: 'I need this table for birthday party' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @IsOptional()
  note: string;

  @ApiPropertyOptional({ example: '+977+9876543210' })
  @IsNotEmpty()
  @IsPhoneNumber()
  @IsOptional()
  phone_number: string;

  @ApiPropertyOptional({ example: 'cc246e98-23cd-40a1-92f2-b418f1ce4fb1' })
  @IsUUID()
  @IsOptional()
  hotel_id: string;

  @ApiPropertyOptional({ example: 'fasdh89-hfs3994-fsdf34f-dsf3ef443e' })
  @IsUUID()
  @IsOptional()
  room_id: string;

  @ApiPropertyOptional({ example: 'fasdh89-hfs3994-fsdf34f-dsf3ef443e' })
  @IsOptional()
  @IsUUID()
  user_id: string;

  @ApiPropertyOptional({ example: 'johndoe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  @IsOptional()
  user_email: string;
}

export class ChangeReservationStatus {
  @ApiProperty({ type: 'enum', example: ReservationStatus.CANCELLED })
  @IsIn([
    ReservationStatus.CANCELLED,
    ReservationStatus.PENDING,
    ReservationStatus.APPROVED,
  ])
  reservation_status: ReservationStatus;

  @ApiPropertyOptional({ example: 'Out of stock' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  cancelled_reason: string;
}

export class CancelReservationDto {
  @ApiPropertyOptional({ example: 'Out of stock' })
  @IsString()
  @IsNotEmpty()
  @IsOptional()
  reason: string;
}

