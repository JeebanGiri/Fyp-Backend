import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsDate,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';

export class RegisterHotelAdminDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
  @MinLength(3)
  @IsOptional()
  full_name: string;

  @ApiProperty({ example: 'johndoe@gmail.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiPropertyOptional({ example: '+9779876543210' })
  @IsPhoneNumber()
  @IsOptional()
  phone_number: string;

  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @MinLength(8)
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class LoginHotelAdminDto {
  @ApiProperty({ example: 'johndoe@example.com' })
  @IsEmail()
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateHotelAdminDocumentDto {
  @ApiProperty()
  @IsString()
  //allow number only
  @Matches(/^[0-9]*$/, {
    message: 'Please provide a valid citizenship number.',
  })
  citizenship_no: string;

  @ApiProperty({ example: 'MM/DD/YYY' })
  @IsDate()
  citizenship_issued_date: string;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_front: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship_back: any;

  @ApiProperty({ example: 'example.jpg', format: 'binary' })
  profile_photo: any;
}

export class UpdateHotelAdminDocumentDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  @Matches(/^[0-9]*$/, {
    message: 'Please provide a valid citizenship number.',
  })
  citizenship_no: string;

  @ApiPropertyOptional({ example: 'MM/DD/YYY' })
  // @IsCustomDateFormat()
  @IsDate()
  @IsOptional()
  issued_date: string;

  @IsOptional()
  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  citizenship: any;

  @ApiPropertyOptional({ example: 'example.jpg', format: 'binary' })
  @IsOptional()
  profile_photo: any;
}
