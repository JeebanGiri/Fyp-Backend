import { Injectable, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { CreateReportDto, UpdateReportDto } from './dto/reports.dto';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Report } from './entities/reports.entity';
import { User, UserRole } from 'src/users/entities/user.entity';

@Injectable()
export class ReportsService {
  constructor(private dataSource: DataSource) {}

  // -------------CREATE REPORT---------------
  async makeReport(user_id: string, payload: CreateReportDto) {
    const reservationExists = await this.dataSource
      .getRepository(Reservation)
      .findOne({
        where: { id: payload.reservation_id },
      });

    if (!reservationExists)
      throw new NotFoundException('Reservation not found');

    const report = await this.dataSource.getRepository(Report).save({
      ...payload,
      user_id,
    });

    return { message: 'Report Created Sucessfully', report: report };
  }

  // ----------GET ALL REPORT-------------
  async findAll() {
    return await this.dataSource.getRepository(Report).find();
  }

  // ----------GET USER REPOR-----------
  async findAllMyReports(user_id: string) {
    return await this.dataSource
      .getRepository(Report)
      .find({ where: { user_id } });
  }

  async updateReport(id: string, updateReportDto: UpdateReportDto, user: User) {
    const where = {};

    if (
      user.role === UserRole.hotel_admin ||
      user.role === UserRole.super_admin
    ) {
      where['id'] = id;
    } else {
      where['id'] = id;
      where['user_id'] = user.id;
    }

    const report = await this.dataSource
      .getRepository(Report)
      .findOne({ where });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return await this.dataSource
      .getRepository(Report)
      .save({ ...report, ...updateReportDto });
  }

  // --------DELETE REPORT-------------
  async remove(id: string, user: User) {
    const where = {};

    if (
      user.role === UserRole.hotel_admin ||
      user.role === UserRole.super_admin
    ) {
      where['id'] = id;
    } else {
      where['id'] = id;
      where['user_id'] = user.id;
    }

    const report = await this.dataSource
      .getRepository(Report)
      .findOne({ where });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return await this.dataSource.getRepository(Report).delete({ id });
  }
}
