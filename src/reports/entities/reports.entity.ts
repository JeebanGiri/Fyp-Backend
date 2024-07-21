// import { Reservation } from 'src/reservation/entities/reservation.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ReportType {
  REVENUE = 'REVENUE',
  ROOM = 'ROOM',
  HOTEL = 'HOTEL',
  CANCELLATION = 'CANCELLATION',
  APPLICATION = 'APPLICATION',
  CHECKIN_CHECKOUT = 'CHECKIN_CHECKOUT',
  OTHER = 'OTHER',
}

export enum ReportStatus {
  PENDING = 'PENDING',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
}

@Entity('report')
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hotel_name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  hotel_address: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  description: string;

  @Column({ type: 'enum', enum: ReportStatus, default: ReportStatus.PENDING })
  status: ReportStatus;

  @Column({ type: 'enum', enum: ReportType })
  type: ReportType;

  @Column({ type: 'text', nullable: true })
  response: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // ----------RELATIONS----------
  @Column()
  user_id: string;

  @ManyToOne(() => User, (user) => user.report, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  // @Column()
  // reservation_id: string;

  // @ManyToOne(() => Reservation, (reservation) => reservation.report, {
  //   onDelete: 'CASCADE',
  // })
  // @JoinColumn({ name: 'reservation_id' })
  // reservation: Reservation;
}
