import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsArray,
  IsDate,
  IsDateString,
  IsInt,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export interface ITimeRange {
  check_in_time: string;
  check_out_time: string;
}

export class CreateHotelDto {
  @ApiProperty({ example: 'Hotel Residence' })
  @IsString()
  @MinLength(5)
  hotel_name: string;

  @ApiProperty({ example: 'Biratchowk, Morang' })
  @IsString()
  @MinLength(3)
  address: string;

  @ApiProperty({ example: '+9779876543210' })
  @IsPhoneNumber()
  phone_number: string;

  @ApiProperty({ example: 'example.jpg', format: 'binary' })
  avatar: any;

  @ApiProperty({ example: 'example.jpg', format: 'binary' })
  cover: any;

  @ApiProperty({
    example: {
      check_in_time: '10:40 AM',
      check_out_time: '5:50 PM',
    },
  })
  @IsOptional()
  checkin_checkout: ITimeRange;

  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  documents?: any[];

  @ApiPropertyOptional({
    example: 'Horizen Residence is a good hotel places for visitors.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty()
  @IsString()
  citizenship_no: string;

  @ApiProperty({ example: '2022-12-26 16:26:00' })
  @IsDateString()
  citizenship_issued_date: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_front: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_back: any;

  @ApiProperty({ example: 'IL170108000000012612345' })
  @MinLength(10)
  @MaxLength(25)
  account_number: string;

  @ApiProperty({ example: 'Prabhu bank' })
  @IsString()
  bank_name: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  account_name: string;

  @ApiProperty({ example: 'Kalimati' })
  @IsString()
  branch_name: string;
}

export class SetLocationDto {
  @ApiProperty({ example: '27.639302' })
  @IsLatitude()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ example: '85.345988' })
  @IsLongitude()
  @IsOptional()
  longitude?: number;
}

export class UpdateHotelDto {
  @ApiProperty({ example: 'HotelX' })
  @IsString()
  @IsOptional()
  @MinLength(5)
  hotel_name?: string;

  @ApiProperty({ example: 'Biratchowk, Morang' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  address?: string;

  @ApiProperty({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
  phone_number?: string;

  @ApiProperty({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  avatar?: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  cover?: any;

  @ApiPropertyOptional({
    example: {
      check_in_time: '10:40 AM',
      check_out_time: '5:50 PM',
    },
  })
  checkin_checkout?: ITimeRange;

  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsArray()
  @IsOptional()
  documents?: any[];

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  citizenship_no: string;

  @ApiPropertyOptional({ example: 'MM/DD/YYY' })
  @IsOptional()
  @IsDateString()
  citizenship_issued_date: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  citizenship_front: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  citizenship_back: any;

  @ApiPropertyOptional({ example: 'IL170108000000012612345' })
  @MinLength(10)
  @MaxLength(25)
  @IsOptional()
  account_number: string;

  @ApiPropertyOptional({ example: 'Prabhu bank' })
  @IsString()
  @IsOptional()
  bank_name: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @IsOptional()
  account_name: string;

  @ApiPropertyOptional({ example: 'Kalimati' })
  @IsString()
  @IsOptional()
  branch_name: string;

  @ApiPropertyOptional({
    example: 'Horizen Residence is a good hotel places for visitors.',
  })
  @IsString()
  description: string;
}

export class Rating {
  @ApiPropertyOptional({ example: '3' })
  @IsInt()
  rating_value: number;

  @IsString()
  user_id: string;
}
