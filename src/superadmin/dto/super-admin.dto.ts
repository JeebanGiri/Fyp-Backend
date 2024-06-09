import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEmail,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { CreateHotelAvailiabilityDto } from 'src/hotel/dto/hotel-availiability.dto';
import { ITimeRange } from 'src/hotel/dto/hotel.dto';

export class RegisterAdminDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  full_name: string;

  @ApiPropertyOptional({ example: 'johndoe@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
  phone_number: string;

  @ApiPropertyOptional({ minLength: 8, example: 'Secret@123' })
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class AddHotelAdminDetailDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  full_name: string;

  @ApiPropertyOptional({ example: 'johndoe@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  address: string;

  @ApiPropertyOptional({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
  phone_number: string;

  @ApiPropertyOptional({ minLength: 8, example: 'Secret@123' })
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'Hotel Residence' })
  @IsString()
  hotel_name: string;

  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  hotel_address: string;

  @ApiPropertyOptional({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
  contact_number: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  avatar: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  cover: any;

  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsNotEmpty()
  @IsArray()
  @IsOptional()
  documents?: any[];

  @ApiProperty({
    example: {
      open_time: '10:40 AM',
      close_time: '5:50 PM',
    },
  })
  checkin_checkout?: ITimeRange;

  @ApiPropertyOptional({
    example: 'Horizen Residence is a good hotel places for visitors.',
  })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsString()
  citizenship_no: string;

  @ApiPropertyOptional({ example: '2024-01-26 16:26:00' })
  @IsDateString()
  citizenship_issued_date: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_front: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_back: any;

  @ApiPropertyOptional({ example: 'IL170108000000012612345' })
  @MinLength(10)
  @MaxLength(25)
  account_number: string;

  @ApiPropertyOptional({ example: 'Prabhu bank' })
  @IsString()
  bank_name: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  account_name: string;

  @ApiPropertyOptional({ example: 'Kalimati' })
  @IsString()
  branch_name: string;
}

export class EditHotelAdminDetailDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  full_name: string;

  @ApiPropertyOptional({ example: 'johndoe@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  @IsOptional()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  address: string;

  @ApiPropertyOptional({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
  phone_number: string;

  @ApiPropertyOptional({ minLength: 8, example: 'Secret@123' })
  @MinLength(8)
  @IsNotEmpty()
  @IsOptional()
  @IsString()
  password: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  profile_photo: any;

  @ApiPropertyOptional({ example: 'Hotel Residence' })
  @IsString()
  @IsOptional()
  hotel_name: string;

  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  hotel_address: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  avatar: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  cover: any;

  @IsNotEmpty()
  @IsArray()
  @ApiPropertyOptional({ type: 'array', format: 'binary', isArray: true })
  @IsOptional()
  documents?: string[];

  @ApiPropertyOptional({ example: '27.639302' })
  @IsLatitude()
  @IsOptional()
  latitude: number;

  @ApiPropertyOptional({ example: '85.345988' })
  @IsLongitude()
  @IsOptional()
  longitude: number;

  @ApiPropertyOptional({
    example: {
      open_time: '10:40 AM',
      close_time: '5:50 PM',
    },
  })
  @ValidateNested()
  @IsOptional()
  opening_hours?: ITimeRange;

  @ApiPropertyOptional({
    example: {
      open: true,
      close: false,
    },
  })
  @ValidateNested()
  @IsOptional()
  @Type(() => CreateHotelAvailiabilityDto)
  availability: CreateHotelAvailiabilityDto;

  @ApiPropertyOptional({ example: '8968-32838-32743' })
  @IsString()
  @IsOptional()
  citizenship_no: string;

  @ApiPropertyOptional({ example: '2024-01-26 16:26:00' })
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
}