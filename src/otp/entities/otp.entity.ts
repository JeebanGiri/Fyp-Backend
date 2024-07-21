import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../../users/entities/user.entity';

export enum OTPType {
  emailVerification = 'EMAIL_VERIFICATION',
  phoneVerification = 'PHONE_VERIFICATION',
  passwordReset = 'PASSWORD_RESET',
  other = 'OTHER',
}

@Entity('otp')
export class OTP {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 5 })
  code: string;

  @Column({ type: 'enum', enum: OTPType, default: OTPType.other })
  type: OTPType;

  @Column()
  user_id: string;
  @ManyToOne(() => User, (user) => user.otps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @CreateDateColumn()
  created_at: Date;
}
