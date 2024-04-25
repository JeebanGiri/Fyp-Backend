import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  MinLength,
  IsString,
  IsOptional,
  IsEnum,
  IsPhoneNumber,
  IsNotEmpty,
  Matches,
  IsStrongPassword,
  IsInt,
} from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class UpdateUserDto {
  @ApiPropertyOptional({ format: 'binary', example: 'user.jpg' })
  @IsOptional()
  avatar?: any;

  @ApiPropertyOptional({ example: 'Kathmandu' })
  @IsOptional()
  address?: string;

  @MinLength(8)
  @ApiPropertyOptional({ minLength: 8, example: 'Secret@123' })
  @IsOptional()
  old_password?: string;

  @ApiProperty({ minLength: 8, example: 'Secret@123' })
  @IsStrongPassword({
    minLength: 8,
    minLowercase: 1,
    minUppercase: 1,
    minNumbers: 1,
  })
  @IsOptional()
  @IsString()
  new_password?: string;

  @ApiPropertyOptional({ example: 'John Doe' })
  @IsOptional()
  @IsString()
  @MinLength(3)
  @Matches(/^[a-zA-Z ]*$/, {
    message: 'Full name must contain only letters and space',
  })
  full_name?: string;

  @IsPhoneNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: '+9779861583920' })
  old_phone_number?: string;

  @IsPhoneNumber()
  @IsOptional()
  @ApiPropertyOptional({ example: '+9779861583920' })
  new_phone_number?: string;
}

export class ChangePasswordDto {
  @ApiPropertyOptional({ minLength: 8, example: 'Secret@123' })
  @IsString()
  @IsOptional()
  old_password?: string;

  @ApiPropertyOptional({ minLength: 8, example: 'Secret@123' })
  @IsString()
  @IsOptional()
  new_password?: string;
}

export class PaginationQuery {
  @ApiPropertyOptional({ example: 1 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiPropertyOptional({ example: 10 })
  @IsInt()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;
}

export class GetUsersQuery extends PaginationQuery {
  @ApiPropertyOptional({ type: 'enum', example: UserRole.customer })
  @IsOptional()
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional({ example: 'john' })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  search: string;
}
