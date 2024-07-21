import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { generateOTP } from '../@helpers/utils';
import { OTP, OTPType } from './entities/otp.entity';

@Injectable()
export class OtpService {
  constructor(private dataSource: DataSource) {}

  async createOtp(user_id: string, type: OTPType) {
    // delete previous OTP if exists
    await this.dataSource.getRepository(OTP).delete({ user_id });
    console.log("Here");
    
    const otp = new OTP();

    otp.code = await generateOTP(5); // generate random 5 digit code
    otp.type = type;
    otp.user_id = user_id;

    console.log("data")
    return this.dataSource.getRepository(OTP).save(otp);
  }

  deleteOtp(user_id: string, code: string, type: OTPType) {
    return this.dataSource.getRepository(OTP).delete({ user_id, code, type });
  }

  async validateOtp(user_id: string, code: string, type: OTPType) {
    // OTP is valid for 15 minutes only
    const expiryTime = 1000 * 60 * 15;

    const otp = await this.dataSource.getRepository(OTP).findOne({
      where: { user_id, code, type },
    });
    if (!otp) return false;

    if (otp.created_at.getTime() + expiryTime < Date.now()) {
      throw new BadRequestException('OTP has expired!');
    }
    return true;
  }

  async findLastOtp(user_id: string, type: OTPType) {
    return await this.dataSource.getRepository(OTP).findOne({
      where: {
        user_id,
        type,
      },
      order: {
        created_at: 'DESC',
      },
    });
  }
}
