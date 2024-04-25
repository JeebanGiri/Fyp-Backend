import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  CreateUserDto,
  EmailVerificationDto,
  FinalizeResetPasswordDto,
  InitiateResetPasswordDto,
  LoginUserDto,
  ResendEmailVerificationCodeDto,
} from './dto/auth.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  // ---------- REGISTER ----------
  @Post('register')
  register(@Body() payload: CreateUserDto) {
    return this.authService.register(payload);
  }

  // ---------- LOGIN ----------
  @Post('login')
  login(@Body() payload: LoginUserDto) {
    return this.authService.login(payload);
  }

  // ---------- EMAIL VERIFICATION ----------

  @Post('email-verification')
  emailVerification(@Body() input: EmailVerificationDto) {
    return this.authService.verifyEmail(input.email, input.code);
    // input.email, input.code
  }

  // ---------- RESEND EMAIL VERIFICATION ----------

  @Post('resend-email-verification')
  resendEmailVerificationCode(@Body() payload: ResendEmailVerificationCodeDto) {
    return this.authService.resendEmailVerificationCode(payload);
  }

  // ---------- INITIATE PASSWORD RESET ----------

  @Post('initiate-password-reset')
  initiatePasswordReset(@Body() payload: InitiateResetPasswordDto) {
    return this.authService.initiatePasswordReset(payload);
  }

  // ---------- FINALIZE PASSWORD RESET ----------

  @Post('finalize-password-reset')
  finalizePasswordReset(@Body() payload: FinalizeResetPasswordDto) {
    return this.authService.finalizePasswordReset(payload);
  }
}
