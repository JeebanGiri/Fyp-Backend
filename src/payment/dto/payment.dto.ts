import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsString } from 'class-validator';

export class CreatePaymentDto {
  @ApiProperty({ example: '100' })
  @IsInt()
  @Type(() => Number)
  amount: number;

  @ApiProperty({ example: 'http://localhost:3157/' })
  @IsNotEmpty()
  @IsString()
  return_url: string;

  @ApiProperty({ example: 'http://localhost:3157/' })
  @IsNotEmpty()
  @IsString()
  website_url: string;

  @ApiProperty({ example: '389267jdad28-bha87372hw' })
  @IsString()
  @IsNotEmpty()
  khalti_token: string;

  @ApiProperty({ example: 'Horizon Residence' })
  @IsNotEmpty()
  book_hotel_name: string;

  @ApiProperty({ example: '89587ujf-nhfsa94-43udh9842-4uw8322' })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty({ example: '476heyw8-78fh32-jfh8w42-34hf7832' })
  @IsString()
  @IsNotEmpty()
  reservation_id: string;
}
