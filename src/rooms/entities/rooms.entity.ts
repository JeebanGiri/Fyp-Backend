import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum RoomAvailiability {
  AVAILABLE = 'Available',
  OCCUPIED = 'Occupied',
  RESERVED = 'Reserved',
  OUT_OF_SERVICE = 'Out of Service',
}

export enum RoomType {
  STANDARD = 'Standard Room',
  DELUXE = 'Deluxe Room',
  DOUBLE = 'Double Room',
  DELUXE_DOUBLE_ROOM = 'Deluxe Double Room',
  TRIPLE_ROOM = 'Triple Room',
}

@Entity('rooms')
export class Rooms {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 20 })
  room_name: string;

  @Column({ type: 'int' })
  room_number: number;

  @Column({ type: 'enum', enum: RoomType, default: RoomType.DELUXE })
  room_type: RoomType;

  @Column({
    type: 'enum',
    enum: RoomAvailiability,
    default: RoomAvailiability.AVAILABLE,
  })
  room_status: RoomAvailiability;

  @Column({ type: 'int', nullable: true })
  room_rate: number;

  @Column({ type: 'int' })
  room_capacity: number;

  @Column({ type: 'text', array: true, default: [] })
  images: string[];

  @Column()
  hotel_id: string;

  @ManyToOne(() => Hotel, (hotel) => hotel.rooms, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'hotel_id' })
  hotel: Hotel;

  @OneToMany(() => Reservation, (reservation) => reservation.rooms, {
    cascade: true,
  })
  reservation: Reservation[];
}
