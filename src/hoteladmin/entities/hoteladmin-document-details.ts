import { Hotel } from 'src/hotel/entities/hotel.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

@Entity('hoteladmin_document_details')
export class HotelAdminDocumentDetails {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'text', nullable: true })
  profile_photo: string;

  @Column({ nullable: true })
  citizenship_no: string;

  @Column({ nullable: true })
  citizenship_issued_date: string;

  @Column({ type: 'text', nullable: true })
  citizenship_front: string;

  @Column({ type: 'text', nullable: true })
  citizenship_back: string;

  @Column()
  user_id: string;

  //-------RELATION------------
  @OneToOne(() => User, (user) => user.document_detail, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({ nullable: true })
  hotel_id: string;

  @OneToOne(() => Hotel, (hotel) => hotel.document_detail, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;
}
