import { Hotel } from 'src/hotel/entities/hotel.entity';
import { User } from 'src/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity({ name: 'rating' })
export class Rating {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int', nullable: true })
  rating_value: number;

  // ---------- RELATIONS ----------
  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.rating, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  hotel_id: string;
  @ManyToOne(() => Hotel, (hotel) => hotel.rating, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;
}
