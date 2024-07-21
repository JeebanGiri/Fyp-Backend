import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNumber, IsString } from 'class-validator';

export class CreateRatingDto {
  @ApiProperty({ example: '3' })
  @IsInt()
  @IsNumber()
  rating_value: number;

  @IsString()
  hotel_id: string;
}
