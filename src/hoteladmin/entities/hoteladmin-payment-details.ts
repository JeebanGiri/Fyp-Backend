import { Hotel } from 'src/hotel/entities/hotel.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('hoteladmin_payment_details')
export class HotelAdminPaymentDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  bank_name: string;

  @Column()
  account_name: string;

  @Column()
  account_number: string;

  @Column()
  branch_name: string;

  @Column()
  user_id: string;

  @OneToOne(() => User, (user) => user.hoteladminpaymentdetails, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  hotel_id: string;

  @OneToOne(() => Hotel, (hotel) => hotel.payment_detail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;
}
