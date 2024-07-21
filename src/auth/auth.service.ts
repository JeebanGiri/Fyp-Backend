import {
  BadRequestException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { DataSource } from 'typeorm';
import {
  CreateUserDto,
  FinalizeResetPasswordDto,
  InitiateResetPasswordDto,
  LoginUserDto,
  ResendEmailVerificationCodeDto,
} from './dto/auth.dto';
import { User, UserRole } from 'src/users/entities/user.entity';
import * as argon from 'argon2';
import { OtpService } from 'src/otp/otp.service';
import { OTPType } from 'src/otp/entities/otp.entity';
import { defaultMailTemplate } from 'src/@helpers/mail-templates/default.mail-template';
import { sendMail } from 'src/@helpers/mail';

@Injectable()
export class AuthService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly jwtService: JwtService,
    private readonly otpService: OtpService,
  ) {}

  // ---------- REGISTER ----------
  async register(payload: CreateUserDto) {
    const { email, password, ...res } = payload;

    const emailExists = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });

    if (emailExists) throw new BadRequestException('Email already exists!');

    const users = new User();

    if (payload.email === 'np05cp4a210059@iic.edu.np') {
      users.role = UserRole.super_admin;
    }
    // Register new user
    const { ...savedUser } = await this.dataSource.getRepository(User).save({
      email,
      password: await argon.hash(password),
      role: users.role,
      ...res,
    });

    // Generate and send OTP
    const otp = await this.otpService.createOtp(
      savedUser.id,
      OTPType.emailVerification,
    );
    sendMail({
      to: email,
      subject: 'Email Verification',
      html: defaultMailTemplate({
        title: 'Email Verification',
        name: savedUser.full_name,
        message: `Your OTP is ${otp.code}`,
      }),
    });
    return {
      message: 'User registered. Please check your mail for verification.',
      user: savedUser,
    };
  }

  //---------- LOGIN ----------
  async login(payload: LoginUserDto) {
    const { email, password } = payload;

    const user = await this.dataSource.getRepository(User).findOne({
      where: { email },
      select: ['id', 'is_verified', 'password', 'role'],
    });

    if (!user)
      throw new UnauthorizedException({
        error: { message: 'Could not find account.' },
      });

    // Validate password
    const validPassword = await argon.verify(user.password, password);

    if (!validPassword)
      throw new UnauthorizedException({
        error: { message: 'Invalid Password.' },
      });

    // Verify user before login if not verified

    if (!user.is_verified) {
      throw new BadRequestException('Please Verify Your Email First');
    } else if (!user.is_verified) {
      const lastOTP = await this.otpService.findLastOtp(
        user.id,
        OTPType.emailVerification,
      );

      const oneMinute = 1000 * 60 * 1;

      if (
        lastOTP &&
        new Date().getTime() - lastOTP.created_at.getTime() < oneMinute
      ) {
        throw new UnauthorizedException({
          error: { message: 'Please wait 1 minute before requesting again.' },
        });
      }

      // Send email with OTP
      const otp = await this.otpService.createOtp(
        user.id,
        OTPType.emailVerification,
      );

      sendMail({
        to: email,
        subject: 'Email Verification',
        html: defaultMailTemplate({
          title: 'Email Verification',
          name: user.full_name ?? 'User',
          message: `Your OTP is ${otp.code}`,
        }),
      });

      throw new UnauthorizedException({
        error: {
          message:
            'Your email is not verified yet. Please check your mail for verification.',
        },
      });
    }

    // change the user status after login
    user.is_initial = true;

    // Generate JWT token
    const access_token = await this.jwtService.signAsync(
      { sub: user.id, role: user.role },
      {
        expiresIn: '15d',
        secret: process.env.JWT_SECRET,
      },
    );
    return {
      access_token,
      is_verified: user.is_verified,
      role: user.role,
      is_initial: user.is_initial,
      user_id: user.id,
      message: 'Login sucessfully!',
    };
  }

  // ---------- EMAIL VERIFICATION ----------
  async verifyEmail(email: string, code: string) {
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });

    if (!user)
      throw new BadRequestException({ error: { message: 'User not found.' } });

    if (user.is_verified)
      throw new BadRequestException({
        error: { message: 'User Already Verified.' },
      });

    const isValid = await this.otpService.validateOtp(
      user.id,
      code,
      OTPType.emailVerification,
    );

    if (!isValid) throw new BadRequestException('Invalid OTP');

    user.is_verified = true;
    await this.dataSource.getRepository(User).save(user);
    await this.otpService.deleteOtp(user.id, code, OTPType.emailVerification);

    return { message: 'Email verified.' };
  }

  // ---------- RESEND EMAIL VERIFICATION ----------
  async resendEmailVerificationCode(payload: ResendEmailVerificationCodeDto) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { email: payload.email },
    });

    if (!user) throw new NotFoundException('User not found');

    if (user.is_verified)
      throw new BadRequestException('User already verified.');

    // Get previous OTP and check if it's been more than 1 minute
    const previousOtp = await this.otpService.findLastOtp(
      user.id,
      OTPType.emailVerification,
    );

    if (previousOtp) {
      const waitTime = 1000 * 60 * 1; // Resend only after one minute
      const completedWaitTime =
        previousOtp.created_at.getTime() + waitTime < Date.now();

      if (!completedWaitTime) {
        throw new BadRequestException('Please request OTP after one minute.');
      }
    }

    // Delete the old otp first
    await this.otpService.deleteOtp(
      user.id,
      previousOtp.code,
      OTPType.emailVerification,
    );

    // Send email with OTP
    const otp = await this.otpService.createOtp(
      user.id,
      OTPType.emailVerification,
    );

    sendMail({
      to: user.email,
      subject: 'Email Verification',
      html: defaultMailTemplate({
        title: 'Email Verification',
        name: user.full_name ?? 'User',
        message: `Your OTP is ${otp.code}`,
      }),
    });

    return {
      message: 'Email verification OTP has been resent. Please check your mail',
    };
  }

  // ---------- INITIATE PASSWORD RESET ----------

  async initiatePasswordReset(payload: InitiateResetPasswordDto) {
    const user = await this.dataSource.getRepository(User).findOne({
      where: { email: payload.email },
    });

    if (!user) throw new NotFoundException('User not found.');

    // Get previous OTP and check if it's been more than 1 minute
    const lastOTP = await this.otpService.findLastOtp(
      user.id,
      OTPType.passwordReset,
    );

    const oneMinute = 1000 * 60 * 1;

    if (
      lastOTP &&
      new Date().getTime() - lastOTP.created_at.getTime() < oneMinute
    ) {
      throw new BadRequestException({
        message: 'Please wait for 1 minute before requesting again.',
      });
    }

    //generate new otp
    const newOtp = await this.otpService.createOtp(
      user.id,
      OTPType.passwordReset,
    );

    sendMail({
      to: payload.email,
      subject: 'Password Reset',
      html: defaultMailTemplate({
        title: 'Password Reset',
        name: user.full_name ?? 'User',
        message: `Your OTP is ${newOtp.code}`,
      }),
    });

    return { message: 'Password reset OTP sent.', email: user.email };
  }

  // ---------- FINALIZE PASSWORD RESET ----------
  async finalizePasswordReset(payload: FinalizeResetPasswordDto) {
    console.log(payload);

    const user = await this.dataSource.getRepository(User).findOne({
      where: { email: payload.email },
    });
    if (!user) throw new BadRequestException('User not found.');

    const isValid = await this.otpService.validateOtp(
      user.id,
      payload.code,
      OTPType.passwordReset,
    );
    if (!isValid) throw new BadRequestException('Invalid OTP');

    user.password = await argon.hash(payload.new_password);
    await this.dataSource.getRepository(User).save(user);
    await this.otpService.deleteOtp(
      user.id,
      payload.code,
      OTPType.passwordReset,
    );
    return { message: 'Password reset successfully.' };
  }
}
