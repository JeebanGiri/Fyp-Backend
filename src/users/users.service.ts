import { BadRequestException, Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import {
  ChangePasswordDto,
  GetUsersQuery,
  UpdateUserDto,
} from './dto/user.dto';
import { paginateResponse } from 'src/@helpers/pagination';
import { OtpService } from 'src/otp/otp.service';
import * as argon from 'argon2';
import * as fs from 'fs';

@Injectable()
export class UsersService {
  constructor(
    private readonly dataSource: DataSource,
    private readonly otpService: OtpService,
  ) {}

  // ---------- GET ALL USERS (ADMIN) ----------
  async getAllUsers(role: UserRole, query: GetUsersQuery) {
    const page = query.page || 1;
    const take = query.limit || 10;
    const skip = (page - 1) * take;

    //Check if admin is trying to get super admin
    if (role === UserRole.super_admin) {
      if (query.role === UserRole.super_admin)
        throw new BadRequestException('You cannot get super admin.');
    }
    if (query.role === UserRole.customer) {
      const qru = this.dataSource
        .getRepository(User)
        .createQueryBuilder('user')
        .where('user.role = :role', { role: query.role })
        .take(take)
        .skip(skip);

      if (query.search) {
        qru.andWhere(
          'user.full_name ILIKE :search OR user.email ILIKE :search OR user.phone_number ILIKE :search',
          {
            search: `%${query.search}%`,
          },
        );
      }

      const users = await qru.getManyAndCount();
      return paginateResponse(users, skip, take);
    } else {
      const users = await this.dataSource.getRepository(User).findAndCount({
        where: { role: query.role },
        skip,
        take,
      });
      return paginateResponse(users, skip, take);
    }
  }
  // ---------- UPDATE CURRENT USER ----------

  async updateCurrentUser(
    user: User,
    payload: UpdateUserDto,
    file?: Express.Multer.File,
  ) {
    const { old_password, old_phone_number, ...rest } = payload;

    if (Object.keys(payload).length === 0 && !file) {
      throw new BadRequestException('No data submitted.');
    }

    if (payload.avatar) {
      payload.avatar = null;
    }
    if (file) {
      payload.avatar = '/' + file.filename;
      if (user.avatar) {
        const path = user.avatar.slice(1);
        if (fs.existsSync(path)) fs.unlinkSync(path);
      }
    }
    //check if password is provided
    if (rest.new_password) {
      // Check if old password is provided
      if (!old_password)
        throw new BadRequestException('Old password is required.');

      // Find the existing user and Check if old password is correct
      const existing_user = await this.dataSource
        .getRepository(User)
        .findOne({ where: { id: user.id }, select: { password: true } });

      const isPasswordValid = await argon.verify(
        existing_user.password,
        old_password,
      );

      if (!isPasswordValid)
        throw new BadRequestException('Old password is incorrect.');

      // Hash new password
      if (old_password === rest.new_password)
        return {
          message: 'New password cannot be the same as the old password.',
        };
      rest.new_password = await argon.hash(rest.new_password);
    }

    if (rest.new_phone_number) {
      if (user.phone_number) {
        // Check if old phone number is provided
        if (!old_phone_number)
          throw new BadRequestException('Old phone number is required.');
        // Check if old phone number is correct
        if (user.phone_number !== old_phone_number)
          throw new BadRequestException('Old phone number is incorrect.');
      }
      const new_phonenbr = (user.phone_number = rest.new_phone_number);
      console.log(new_phonenbr, 'change nbr');
    }

    if (rest.address) {
      if (typeof user.address === 'string') {
        user.address = rest.address;
      }
    }

    await this.dataSource.getRepository(User).save({
      ...rest,
      id: user.id,
      avatar: payload.avatar,
      phone_number: rest.new_phone_number,
    });

    return {
      message: 'Profile updated successfully.',
    };
  }

  async changePassword(user: User, payload: ChangePasswordDto) {
    const { old_password, new_password } = payload;
    if (old_password) {
      if (!old_password)
        throw new BadRequestException('Old password is required.');

      const existing_user = await this.dataSource.getRepository(User).findOne({
        where: { id: user.id },
        select: { id: true, password: true },
      });

      console.log(existing_user.password);
      const isPasswordValid = await argon.verify(
        existing_user.password,
        old_password,
      );

      if (!isPasswordValid)
        throw new BadRequestException('Old password is incorrect.');

      // Hash new password
      if (old_password === new_password)
        return {
          message: 'New password cannot be the same as the old password.',
        };

      const hashedNewPassword = await argon.hash(new_password);
      existing_user.password = hashedNewPassword;
      await this.dataSource
        .getRepository(User)
        .update({ id: existing_user.id }, { password: hashedNewPassword });

      return { message: 'Password Change Successfully!' };
    }
  }
}
