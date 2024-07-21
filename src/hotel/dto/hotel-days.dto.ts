import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class CreateHotelStatusDto {
    @IsString()
    @IsNotEmpty()
    open: string;
  
    @IsString()
    @IsNotEmpty()
    close: string;
  }
  export class UpdateHotelStatusDto {
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    open: string;
  
    @IsString()
    @IsNotEmpty()
    @IsOptional()
    close: string;
  }
  
  export class HotelTimingDto {
    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateHotelStatusDto)
    sunday?: CreateHotelStatusDto[];
  
    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateHotelStatusDto)
    monday?: CreateHotelStatusDto[];
  
    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateHotelStatusDto)
    tuesday?: CreateHotelStatusDto[];
  
    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateHotelStatusDto)
    wednesday?: CreateHotelStatusDto[];
  
    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateHotelStatusDto)
    thursday?: CreateHotelStatusDto[];
  
    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateHotelStatusDto)
    friday?: CreateHotelStatusDto[];
  
    @IsArray()
    @ValidateNested()
    @IsOptional()
    @Type(() => CreateHotelStatusDto)
    saturday?: CreateHotelStatusDto[];
  }
  