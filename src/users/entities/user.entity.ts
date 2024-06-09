import { FirebaseToken } from 'src/firebase/entities/firebase-notification-token.entity';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { HotelAdminDocumentDetails } from 'src/hoteladmin/entities/hoteladmin-document-details';
import { HotelAdminPaymentDetails } from 'src/hoteladmin/entities/hoteladmin-payment-details';
import { Notification } from 'src/notification/entities/notification.entity';
import { OTP } from 'src/otp/entities/otp.entity';
import { Rating } from 'src/rating/entities/rating.entity';
import { Report } from 'src/reports/entities/reports.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum UserRole {
  super_admin = 'SUPER_ADMIN',
  hotel_admin = 'HOTEL_ADMIN',
  customer = 'CUSTOMER',
}

export enum AuthType {
  TRADITIONAL = 'TRADITIONAL',
  GOOGLE = 'GOOGLE',
  APPLE = 'APPLE',
}

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  full_name: string;

  @Column({ unique: true, nullable: true })
  email: string;

  @Column({ type: 'enum', enum: AuthType, default: AuthType.TRADITIONAL })
  auth_type: AuthType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  avatar: string;

  @Column({ select: false, nullable: true })
  password: string;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
  })
  address: string;

  @Column({ nullable: true })
  phone_number: string;

  @Column({ type: 'enum', enum: UserRole, default: UserRole.customer })
  role: UserRole;

  @Column({ type: 'boolean', default: false })
  is_verified: boolean;

  @Column({ type: 'boolean', default: false })
  is_active: boolean;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @DeleteDateColumn()
  deleted_at: Date;

  @Column({ type: 'boolean', nullable: true, default: false })
  is_initial: boolean;

  // ----------- RELATIONS ----------------
  @OneToMany(() => OTP, (otp) => otp.user, { cascade: true })
  otps: OTP[];

  @OneToOne(() => Hotel, (hotel) => hotel.user, { cascade: true, onDelete: 'CASCADE' })
  hotel: Hotel;

  @OneToMany(() => Reservation, (reservation) => reservation.user, {
    cascade: true,
  })
  reservation: Reservation[];

  @OneToMany(() => Report, (reports) => reports.user, { cascade: true })
  report: Report[];

  @OneToMany(() => Notification, (notification) => notification.user, {
    cascade: true,
  })
  notifications: Notification[];

  @Column({ nullable: true })
  payment_id: string;

  @OneToOne(
    () => HotelAdminPaymentDetails,
    (hoteladminpaymentdetails) => hoteladminpaymentdetails.user,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'payment_id' })
  hoteladminpaymentdetails: HotelAdminPaymentDetails;

  @Column({ nullable: true })
  document_details_id: string;

  @OneToOne(
    () => HotelAdminDocumentDetails,
    (hote_admin_document_details) => hote_admin_document_details.user,
    { cascade: true, onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'document_details_id' })
  document_detail: HotelAdminDocumentDetails;

  @OneToMany(
    () => FirebaseToken,
    (firebase_notification_token) => firebase_notification_token.user,
    { cascade: true },
  )
  firebase_notification_tokens: FirebaseToken[];

  @OneToMany(() => Rating, (rating) => rating.user, { cascade: true })
  rating: Rating[];
}
