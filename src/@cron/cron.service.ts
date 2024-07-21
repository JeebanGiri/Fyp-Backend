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
    const currentDate = new Date();
    console.log(`Cron job triggered at ${currentDate.toISOString()}`);
    const reservations = await this.dataSource
      .getRepository(Reservation)
      .find();
    console.log(`Found ${reservations.length} reservations`);
    for (const reservation of reservations) {
      const findReservation = await this.dataSource
        .getRepository(Reservation)
        .findOne({ where: { id: reservation.id } });
      const foundReservation = await this.dataSource
        .getRepository(Reservation)
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.rooms', 'rooms')
        .where('reservation.id = :id', { id: findReservation.id })
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
      await this.dataSource.getRepository(Reservation).save(reservation);
    }
  }
}
