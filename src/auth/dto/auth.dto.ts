import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsPhoneNumber,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class GPayloadDto {
  @ApiProperty({
    example:
      'ya29.a0AbVbY6PH6R33hebcVR53AE1Ou6DL8JOX0bECns0oID6EQg7Bvuo2k2Bpq5SNyAwlAnkcbBrqzTHFwcSWklr3Ya0eLcjM4ZShEQ6Kcm_8YGv-CWUNmS0JstB8PzHk-HP7JJqUxMWr1E6MGqaFtYlCxiwqy7ttaCgYKAVoSARISFQHsvYlsSBoO3Yrw4Uo3eD61g19ijQ0163',
  })
  @IsString()
  @IsNotEmpty()
  access_token: string;
}

//____________REGISTER USER DTO______________
export class CreateUserDto {
  @ApiPropertyOptional({ example: 'John Doe' })
  @IsString()
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

//__________LOGIN USER DTO______________
export class LoginUserDto {
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

//__________EMAIL EVRIFICAION DTO_____________
export class EmailVerificationDto {
  @IsString()
  @MinLength(5)
  @ApiProperty({ example: '12345' })
  code: string;

  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

//__________RESEND EMAIL VERIFICATION DTO___________
export class ResendEmailVerificationCodeDto {
  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

// ___________DTO FOR PASSWORD RESET DTO____________
export class InitiateResetPasswordDto {
  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;
}

// ____________DTO FOR RESET PASSWORD DTO_________________

export class  FinalizeResetPasswordDto {
  @IsEmail()
  @ApiProperty({ example: 'johndoe@example.com' })
  @Transform(({ value }) => value.toLowerCase())
  email: string;

  @ApiProperty({ example: '123456' })
  @IsString()
  @MinLength(5)
  @MaxLength(5)
  code: string;

  @ApiProperty({ minLength: 8, example: 'Secret@520' })
  @MinLength(8)
  @IsString()
  @IsNotEmpty()
  new_password: string;
}

