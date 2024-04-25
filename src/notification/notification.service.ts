import { BadRequestException, Injectable } from '@nestjs/common';
import { PaginationQuery } from 'src/users/dto/user.dto';
import { DataSource } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { paginateResponse } from 'src/@helpers/pagination';

@Injectable()
export class NotificationService {
  constructor(private dataSource: DataSource) {}
  async getMyNotification(user_id: string, options?: PaginationQuery) {
    const take = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * take;

    const data = await this.dataSource
      .getRepository(Notification)
      .findAndCount({
        where: { user_id },
        order: { created_at: 'DESC' },
        take,
        skip,
      });
    return paginateResponse(data, page, take);
  }

  // ---------- DELETE NOTIFICATION ----------

  async deleteNotification(user_id: string, id: string) {
    //Check if notification exists
    const notification = await this.dataSource
      .getRepository(Notification)
      .findOne({ where: { id, user_id } });

    if (!notification) throw new BadRequestException('Notification not found');

    //delete notification
    await this.dataSource.getRepository(Notification).delete(id);

    return { message: 'Notification deleted successfully' };
  }
}
