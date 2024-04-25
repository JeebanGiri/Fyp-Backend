import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsUUID } from 'class-validator';
import { PaginationDto } from 'src/hotel/dto/pagination.dto';

export class GetAllMessagePayload {
  @ApiProperty({ example: '8e1cdff0-395a-4945-978c-983603576ef6' })
  @IsUUID()
  room_id: string;

  @ApiProperty({ example: { page: 2, limit: 5 } })
  @IsOptional()
  options: PaginationDto;
}

export class GetARoomPayload {
  @ApiProperty({ example: '8e1cdff0-395a-4945-978c-983603576ef6' })
  @IsUUID()
  room_id: string;
}

export class DeleteAMessagePayload {
  @ApiProperty({ example: '8e1cdff0-395a-4945-978c-983603576ef6' })
  @IsUUID()
  message_id: string;
}

export class GetBookDetailsPayload {
  @ApiProperty({ example: '8e1cdff0-395a-4945-978c-983603576ef6' })
  @IsUUID()
  book_id: string;
}


