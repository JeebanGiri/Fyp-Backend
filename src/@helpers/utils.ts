import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export const generateOTP = async (n: number) => {
  let OTP = '';
  const possible = '0123456789';
  for (let i = 0; i < n; i++) {
    OTP += possible.charAt(Math.floor(Math.random() * possible.length));
  }
  return OTP;
};

