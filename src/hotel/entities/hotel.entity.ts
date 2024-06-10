import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Rooms } from 'src/rooms/entities/rooms.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  Point,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ITimeRange } from '../dto/hotel.dto';
import { HotelAvailiability } from '../dto/hotel-availiability.dto';
import { HotelAdminPaymentDetails } from 'src/hoteladmin/entities/hoteladmin-payment-details';
import { HotelAdminDocumentDetails } from 'src/hoteladmin/entities/hoteladmin-document-details';
import { Rating } from 'src/rating/entities/rating.entity';

export enum HotelApproveStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  CANCELLED = 'CANCELLED',
}

@Entity({ name: 'hotel' })
export class Hotel {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 25, nullable: true })
  name: string;

  @Column()
  address: string;

  @Column({ type: 'varchar', length: 1000, nullable: true })
  description?: string;

  @Column({ type: 'text' })
  avatar: string;

  @Column({ type: 'text', nullable: true })
  cover?: string;

  @Column({ type: 'text', nullable: true })
  phone_number: string;

  @Column({
    type: 'geometry',
    spatialFeatureType: 'point',
    srid: 4326,
    nullable: true,
  })
  location: Point;

  @Column({ type: 'boolean', default: false })
  is_open: boolean;

  @Column({
    type: 'enum',
    enum: HotelApproveStatus,
    default: HotelApproveStatus.PENDING,
  })
  status: HotelApproveStatus;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'text', array: true, default: [] })
  documents: string[];

  @Column({
    type: 'jsonb',
    default: {
      check_in_time: '10:40 AM',
      check_out_time: '10:50 Am',
    },
  })
  checkin_checkout: ITimeRange;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'int', nullable: true })
  rating_value: number;

  @Column({ type: 'boolean', default: false })
  is_popular: boolean;

  @Column({
    type: 'enum',
    enum: HotelAvailiability,
    default: HotelAvailiability.open,
  })
  availiability: HotelAvailiability;

  // ---------- RELATIONS ----------
  @Column()
  user_id: string;
  @OneToOne(() => User, (user) => user.hotel, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @OneToMany(() => Rooms, (rooms) => rooms.hotel, { cascade: true })
  rooms: Rooms[];

  @OneToMany(() => Reservation, (reservation) => reservation.hotel, {
    cascade: true,
  })
  reservation: Reservation[];

  @Column({ nullable: true })
  payment_id: string;

  @OneToOne(
    () => HotelAdminPaymentDetails,
    (paymentDetails) => paymentDetails.hotel,
    { cascade: true },
  )
  @JoinColumn({ name: 'payment_id' })
  payment_detail: HotelAdminPaymentDetails;

  @Column({ nullable: true })
  document_Details_id: string;

  @OneToOne(
    () => HotelAdminDocumentDetails,
    (documentDetails) => documentDetails.hotel,
    { cascade: true },
  )
  document_detail: HotelAdminDocumentDetails;

  @OneToMany(() => Rating, (rating) => rating.hotel, { cascade: true })
  rating: Rating[];
}
