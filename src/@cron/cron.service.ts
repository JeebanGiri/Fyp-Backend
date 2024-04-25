import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { RoomAvailiability } from 'src/rooms/entities/rooms.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class CronService {
  constructor(private readonly dataSource: DataSource) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron() {
    const reservations = await this.dataSource
      .getRepository(Reservation)
      .find();

    const currentDate = new Date();

    for (const reservation of reservations) {
      const findReservation = await this.dataSource
        .getRepository(Reservation)
        .findOne({ where: { id: reservation.id } });

      const foundReservation = await this.dataSource
        .getRepository(Reservation)
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.rooms', 'rooms')
        .where('reservation.id = : bookId', { bookId: findReservation.id })
        .getOne();

      const rooms = foundReservation.rooms;

      const checkoutDate = new Date(reservation.check_Out_Date);
      console.log(checkoutDate, 'From cron');
      const cDate = currentDate.getTime();
      const rDate = checkoutDate.getTime();
      if (cDate > rDate) {
        await this.dataSource.transaction(async (entityManager) => {
          if (rooms) {
            // Update the room status to available
            rooms.room_status = RoomAvailiability.AVAILABLE;
            await entityManager.save(rooms);
          }
        });
      }
    }
  }

  // Cron job for not responding reminders
  @Cron(CronExpression.EVERY_10_SECONDS)
  async handleCron2() {
    // Getting unresponed reminder
  }
}
