import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsEnum,
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Matches,
} from 'class-validator';
import { ReportStatus, ReportType } from '../entities/reports.entity';

export class CreateReportDto {
  @ApiProperty({ example: 'UI', description: 'Type of the report' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9 ]*$/, {
    message: 'Title must be alphanumeric',
  })
  @ApiProperty({
    type: 'enum',
    enum: [ReportType.HOTEL, ReportType.REVENUE],
    example: ReportType.REVENUE,
  })
  @IsEnum([ReportType.CANCELLATION, ReportType.REVENUE])
  @IsIn([ReportType.REVENUE, ReportType.HOTEL])
  @IsNotEmpty()
  type: ReportType;

  @ApiProperty({
    example: 'UI is not good',
    description: 'Description of the report',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9 .?]*$/, {
    message: 'Description must be alphanumeric',
  })
  description: string;

  @ApiPropertyOptional({ example: 'a455a747-6d5b-4471-84e1-a6e366c8c070' })
  @IsUUID()
  @IsOptional()
  reservation_id: string;
}

export class UpdateReportDto extends PartialType(CreateReportDto) {
  @ApiPropertyOptional({ example: ReportStatus.IN_PROGRESS })
  @IsEnum(ReportStatus)
  @IsNotEmpty()
  status: ReportStatus;

  @ApiPropertyOptional({ example: 'UI is not good' })
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-zA-Z0-9 ]*$/, {
    message: 'Response must be alphanumeric',
  })
  response: string;
}
