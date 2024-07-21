import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { RoomType } from '../entities/rooms.entity';
import { Type } from 'class-transformer';

export class CreateRoomDto {
  @ApiProperty({ example: 'Executive Suite' })
  @IsString()
  room_name: string;

  @ApiProperty({ example: '100' })
  @IsInt()
  @Type(() => Number)
  room_number: number;

  @ApiProperty({
    type: 'enum',
    enum: [RoomType.DELUXE, RoomType.DELUXE_DOUBLE_ROOM],
    example: RoomType.DELUXE,
  })
  @IsNotEmpty()
  room_type: RoomType;

  @ApiProperty({ example: '1000' })
  @IsInt()
  @Type(() => Number)
  room_rate: number;

  @ApiProperty({ example: '4' })
  @IsInt()
  @Type(() => Number)
  room_capacity: number;

  @ApiProperty({ type: 'array', format: 'binary', isArray: true })
  @IsArray()
  @IsNotEmpty()
  @IsOptional()
  images?: any[];
}

export class UpdateRoomDto {
  @ApiPropertyOptional({ example: 'Executive Suite' })
  @IsOptional()
  @IsString()
  room_name?: string;

  @ApiPropertyOptional({ example: '100' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  room_number?: number;

  @ApiPropertyOptional({
    type: 'enum',
    enum: [
      RoomType.DELUXE,
      RoomType.DELUXE_DOUBLE_ROOM,
      RoomType.DOUBLE,
      RoomType.TRIPLE_ROOM,
      RoomType.STANDARD,
    ],
    example: RoomType.DELUXE,
  })
  @IsIn([
    RoomType.DELUXE,
    RoomType.DELUXE_DOUBLE_ROOM,
    RoomType.DOUBLE,
    RoomType.STANDARD,
    RoomType.TRIPLE_ROOM,
  ])
  @IsOptional()
  room_type?: RoomType;

  @ApiPropertyOptional({ example: '1000' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  room_rate?: number;

  @ApiPropertyOptional({ example: '4' })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  room_capacity?: number;

  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  images?: any[];
}
