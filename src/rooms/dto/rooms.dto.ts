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
  name?: string;

  @ApiPropertyOptional({ example: '100' })
  @IsOptional()
  @IsNumber()
  room_number?: number;

  @ApiPropertyOptional({
    type: 'enum',
    enum: [RoomType.DELUXE, RoomType.DELUXE_DOUBLE_ROOM],
    example: RoomType.DELUXE,
  })
  @IsEnum([RoomType.DELUXE, RoomType.TRIPLE_ROOM])
  @IsIn([RoomType.STANDARD, RoomType.DELUXE])
  @IsNotEmpty()
  room_type: RoomType;

  @ApiPropertyOptional({ example: '1000' })
  @IsOptional()
  @IsNumber()
  room_rate?: number;

  @ApiPropertyOptional({ example: '4' })
  @IsOptional()
  @IsNumber()
  room_capicity?: number;

  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsOptional()
  @IsArray()
  @IsNotEmpty()
  images?: any[];

  @ApiProperty({ example: '8943f3-nfj34f-njwhi3-nfhj42-fejhf3' })
  @IsString()
  hotel_id: string;
}
