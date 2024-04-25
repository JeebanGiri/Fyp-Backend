import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentType {
  KHALTI = 'KHALTI',
  ESEWA = 'ESEWA',
  STRIPE = 'STRIPE',
}
export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETEd',
}
@Entity('payment')
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'int' })
  amount: number;

  @Column({ type: 'int', nullable: true })
  total_amount: number;

  @Column({ type: 'varchar' })
  khalti_token: string;

  @Column({ type: 'varchar' })
  khalti_mobile: string;

  @Column({ type: 'enum', enum: PaymentType, default: PaymentType.KHALTI })
  payment_type: PaymentType;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @CreateDateColumn()
  createAt: Date;

  
}
