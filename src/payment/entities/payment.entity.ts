import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum PaymentGateway {
  KHALTI = 'KHALTI',
  ESEWA = 'ESEWA',
  STRIPE = 'STRIPE',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  COMPLETED = 'COMPLETED',
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

  @Column({
    type: 'enum',
    enum: PaymentGateway,
    default: PaymentGateway.KHALTI,
  })
  payment_type: PaymentGateway;

  @Column({ type: 'enum', enum: PaymentStatus, default: PaymentStatus.PENDING })
  payment_status: PaymentStatus;

  @CreateDateColumn()
  createAt: Date;

  @Column({ type: 'varchar', nullable: true })
  stripe_payment_intent_id: string;
}
