import { IsBooleanString, IsOptional } from 'class-validator';

export enum HotelAvailiability {
  open = 'open',
  close = 'close',
}

export class CreateHotelAvailiabilityDto {
  @IsBooleanString()
  open: boolean;

  @IsBooleanString()
  close: string;
}

export class UpdateHotelAvailiabilityDto {
  @IsBooleanString()
  @IsOptional()
  open: boolean;

  @IsBooleanString()
  @IsOptional()
  close: string;
}
