import { Reservation } from 'src/reservation/entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum NotificationType {
  customer = 'CUSTOMER',
  book = 'BOOK',
  message = 'MESSAGE',
  offer = 'OFFER',
  advertisement = 'ADVERTISEMENT',
}
@Entity('notification')
export class Notification {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column()
  body: string;

  @Column({ type: 'enum', enum: NotificationType })
  notification_type: NotificationType;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  created_at: Date;

  // ----------- RELATIONS ----------------
  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.notifications, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  reservation_id: string;
  @ManyToOne(() => Reservation, (reservation) => reservation.notifications, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'reservation_id' })
  reservation: Reservation;
}
