import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ReportsService } from './reports.service';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { User, UserRole } from 'src/users/entities/user.entity';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { Roles } from 'src/@decorators/roles.decorator';
import { GetUser } from 'src/@decorators/getUser.decorator';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';

@ApiBearerAuth('JWT_auth')
@ApiTags('Report')
@Controller('reports')
export class ReportsController {
  constructor(private reportService: ReportsService) {}

  // ------------------CREATE REPORT--------------------
  @Post()
  @ApiOperation({
    summary: 'Create a report',
    description: `${(UserRole.super_admin, UserRole.hotel_admin)}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin, UserRole.super_admin)
  createReport(
    @GetUser('user_id') user_id: string,
    @Body() payload: CreateReportDto,
  ) {
    return this.reportService.makeReport(user_id, payload);
  }
  // ----------------GET ALL REPORT------------------
  @ApiOperation({
    summary: 'Get All Reports',
    description: `${(UserRole.hotel_admin, UserRole.super_admin)}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin, UserRole.super_admin)
  findAll() {
    return this.reportService.findAll();
  }

  // -----------GET USER REPORT-------------
  @Get('my-reports')
  @ApiOperation({ summary: 'Get my report ' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer, UserRole.hotel_admin, UserRole.super_admin)
  findAllMyReports(@GetUser('id') user_id: string) {
    return this.reportService.findAllMyReports(user_id);
  }

  @ApiOperation({
    summary: 'Update the report.',
    description: `${(UserRole.hotel_admin, UserRole.super_admin)}`,
  })
  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin, UserRole.super_admin)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateReportDto: UpdateReportDto,
    @GetUser() user: User,
  ) {
    return this.reportService.updateReport(id, updateReportDto, user);
  }

  @ApiOperation({
    summary: 'Delete the report.',
    description: `${(UserRole.hotel_admin, UserRole.super_admin)}`,
  })
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin, UserRole.super_admin)
  remove(@Param('id', ParseUUIDPipe) id: string, @GetUser() user: User) {
    return this.reportService.remove(id, user);
  }
}
