import { Hotel } from 'src/hotel/entities/hotel.entity';
import { RoomType, Rooms } from 'src/rooms/entities/rooms.entity';
import { User } from 'src/users/entities/user.entity';

import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum ReservationStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

@Entity('reservation')
export class Reservation {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @CreateDateColumn()
  start_Time: Date;

  @Column({ type: 'varchar' })
  full_name: string;

  @Column({ type: 'varchar', nullable: true })
  phone_number: string;

  @Column({ type: 'varchar' })
  user_email: string;

  @Column({ type: 'varchar' })
  country: string;

  @Column({ type: 'enum', enum: RoomType, nullable: true })
  room_type: string;

  @Column({ type: 'int', nullable: true })
  room_quantity: number;

  @Column()
  check_In_Date: string;

  @Column()
  check_Out_Date: string;

  @Column({ type: 'int', nullable: true })
  total_amount: number;

  @Column({ type: 'varchar', length: 500, nullable: true })
  note: string;

  @Column({
    type: 'enum',
    enum: ReservationStatus,
    default: ReservationStatus.PENDING,
  })
  status: ReservationStatus;

  @Column({ type: 'varchar', length: 500, nullable: true })
  cancel_reason: string;

  @CreateDateColumn()
  booking_Date: Date;

  @CreateDateColumn()
  createAt: Date;

  @CreateDateColumn()
  updatedAt: Date;

  // --------RELATIONS-----------
  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  hotel_id: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @Column()
  room_id: string;

  @ManyToOne(() => Rooms, (rooms) => rooms.reservation, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'room_id' })
  rooms: Rooms;

  @Column({ default: false, nullable: true })
  hasCustomerPaid: boolean;

  @Column({ nullable: true })
  paymentGatewayId: string;
}
