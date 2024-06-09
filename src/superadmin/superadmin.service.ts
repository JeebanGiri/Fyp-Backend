import { BadRequestException, Injectable } from '@nestjs/common';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  AddHotelAdminDetailDto,
  EditHotelAdminDetailDto,
  RegisterAdminDto,
} from './dto/super-admin.dto';
import { DataSource } from 'typeorm';
import { Hotel, HotelApproveStatus } from 'src/hotel/entities/hotel.entity';
import * as argon from 'argon2';
import { HotelAdminDocumentDetails } from 'src/hoteladmin/entities/hoteladmin-document-details';
import { HotelAdminPaymentDetails } from 'src/hoteladmin/entities/hoteladmin-payment-details';
import { sendMail } from 'src/@helpers/mail';
import { defaultMailTemplate } from 'src/@helpers/mail-templates/default.mail-template';
import { Reservation } from 'src/reservation/entities/reservation.entity';
import { Rooms } from 'src/rooms/entities/rooms.entity';
import { PaginationDto } from 'src/hotel/dto/pagination.dto';
import { FirebaseService } from 'src/firebase/firebase.service';
import {
  Notification,
  NotificationType,
} from 'src/notification/entities/notification.entity';

@Injectable()
export class SuperadminService {
  constructor(
    private dataSource: DataSource,
    private readonly firebaseService: FirebaseService,
  ) {}

  // ---------- REGISTER HOTEL ADMIN ----------------

  async registerHotelAdmin(payload: RegisterAdminDto) {
    const { email, password, ...res } = payload;

    //check if admin exists
    const emailExists = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });

    if (emailExists)
      throw new BadRequestException({ message: `Email already exists` });

    const hashedPassword = await argon.hash(password);

    const { ...savedAdmin } = await this.dataSource.getRepository(User).save({
      email: email.toLowerCase(),
      password: hashedPassword,
      role: UserRole.hotel_admin,
      is_verified: true,
      ...res,
    });

    return { message: 'Admin registered', user: savedAdmin };
  }

  // ----------------- REGISTER HOTEL AND ADMIN DETAILS -------------
  async addHotelAdminDetails(
    payload: AddHotelAdminDetailDto,
    files: Express.Multer.File[],
  ) {
    const queryRunner = await this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      if (!files)
        throw new BadRequestException('Upload "avatar"* and "cover" files');

      if (!files['citizenship_front'] || !files['citizenship_back']) {
        throw new BadRequestException(
          'Hotel Admin document details are required.',
        );
      }
      payload.citizenship_front = '/' + files['citizenship_front'][0].filename;
      payload.citizenship_back = '/' + files['citizenship_back'][0].filename;

      if (!files['avatar']) throw new BadRequestException('Avatar is required');
      if (!files['cover']) throw new BadRequestException('Cover is required');

      if (!files['documents'])
        throw new BadRequestException('Documents are required');

      payload.avatar = '/' + files['avatar'][0].filename;

      if (files['cover']) {
        payload.cover = '/' + files['cover'][0].filename;
      }
      if (files['documents'] && files['documents'].length > 0) {
        payload.documents = [];
        files['documents'].forEach((documentFile) => {
          const documentPath = documentFile.filename;
          payload.documents.push(documentPath);
        });
      }

      // Check if Hotel Admin exists
      const emailExists = await this.dataSource.getRepository(User).findOne({
        where: {
          email: payload.email,
        },
      });

      if (emailExists)
        throw new BadRequestException(
          'User with this email already have hotel!',
        );

      if (emailExists) {
        const hotelExist = await this.dataSource
          .getRepository(Hotel)
          .findOne({ where: { user_id: emailExists.id } });
        if (hotelExist)
          throw new BadRequestException('User already have a Hotel');
      }

      const hashedPassword = await argon.hash(payload.password);

      // Create new Hotel Admin
      const hotel_admin = await queryRunner.manager.getRepository(User).save({
        ...payload,
        email: payload.email.toLocaleLowerCase(),
        phone_number: payload.phone_number,
        password: hashedPassword,
        role: UserRole.hotel_admin,
        is_verified: true,
      });


      const { account_name, account_number, bank_name, branch_name, ...res } =
        payload;

      const hotel = new Hotel();
      hotel.name = payload.hotel_name;
      hotel.address = payload.hotel_address;
      hotel.cover = payload.cover;
      hotel.avatar = payload.avatar;
      hotel.documents = payload.documents;
      hotel.is_verified = true;
      hotel.status = HotelApproveStatus.APPROVED;
      // hotel.location = location;
      hotel.user_id = hotel_admin.id;
      hotel.description = payload.description;
      await queryRunner.manager.getRepository(Hotel).save(hotel);


      // create document details of the Hotel Admin
      await queryRunner.manager.getRepository(HotelAdminDocumentDetails).save({
        ...payload,
        user_id: hotel_admin.id,
        hotel_id: hotel.id,
      });


      // create bank details of the Hotel Admin
      await queryRunner.manager.getRepository(HotelAdminPaymentDetails).save({
        user_id: hotel_admin.id,
        hotel_id: hotel.id,
        account_name,
        account_number,
        bank_name,
        branch_name,
        ...res,
      });


      sendMail({
        to: payload.email,
        subject: 'Login Credentials',
        html: defaultMailTemplate({
          title: 'Login Creadentials',
          name: hotel_admin.full_name ?? 'User',
          message: `Your email is ${payload.email} <br/>
        Your Password is ${payload.password}`,
        }),
      });


      const title = 'Your Hotel is Listed.';
      const body = `A Hotel ${hotel.name} is Listed by Admin.`;

      await queryRunner.manager.getRepository(Notification).save({
        title: title,
        body: body,
        user_id: hotel_admin.id,
        notification_type: NotificationType.message,
      });


      await this.firebaseService.sendPushNotifications([hotel_admin.id], {
        title,
        body,
      });


      await queryRunner.commitTransaction();

      return {
        message: 'Hotel Details has been added successfully!',
        hotel,
      };
    } catch (error: any) {
      // Rollback the transaction in case of an error
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(error.message);
    } finally {
      // Release the query runner resources
      await queryRunner.release();
    }
  }

  // ----------EDIT HOTEL ADMIN DETAILS -------------
  async UpdateHotelAdminDetails(
    user_id: string,
    payload: EditHotelAdminDetailDto,
    files: Express.Multer.File[],
  ) {
    // Get the hotel of the hotel admin
    const hotel = await this.dataSource.manager.getRepository(Hotel).findOne({
      where: {
        user_id: user_id,
      },
      select: {
        id: true,
      },
    });
    if (!hotel) throw new BadRequestException('Hotel Not Found');

    // Manage uploaded files
    if (files) {
      if (files['profile_photo']) {
        payload.profile_photo = '/' + files['profile_photo'][0].path;
      }
      if (files['avatar']) {
        payload.avatar = '/' + files['avatar'][0].path;
      }
      if (files['cover']) {
        payload.cover = '/' + files['cover'][0].path;
      }
      if (files['citizenship_front']) {
        payload.citizenship_front = '/' + files['citizenship_front'][0].path;
      }
      if (files['citizenship_back']) {
        payload.citizenship_back = '/' + files['citizenship_back'][0].path;
      }
      if (files['documents']) {
        payload.documents = [];
        files['documents'].forEach((document) => {
          payload.documents.push('/' + document.path);
        });
      }
    }

    // Update details
    await this.dataSource.manager.getRepository(Hotel).save({
      ...payload,
      id: hotel.id,
    });

    const hotelAdminDocumentDetails = await this.dataSource.manager
      .getRepository(HotelAdminDocumentDetails)
      .findOne({ where: { user_id: user_id } });

    const hotelAdminPaymentDetails = await this.dataSource.manager
      .getRepository(HotelAdminPaymentDetails)
      .findOne({ where: { user_id: user_id } });

    Object.assign(hotelAdminDocumentDetails, payload);
    Object.assign(hotelAdminPaymentDetails, payload);

    await this.dataSource.manager
      .getRepository(HotelAdminDocumentDetails)
      .save(hotelAdminDocumentDetails);
    await this.dataSource.manager
      .getRepository(HotelAdminPaymentDetails)
      .save(hotelAdminPaymentDetails);

    return { message: 'Hotel Details updated Sucessfully!' };
  }

  // ----------APPROVE HOTEL ADMIN DETAILS---------------
  // async approveHotelAdminDetails(hotel_id: string) {
  //   const hotel = await this.dataSource
  //     .getRepository(Hotel)
  //     .findOne({ where: { id: hotel_id } });

  //   if (hotel.status === HotelApproveStatus.PENDING) {
  //     hotel.status = HotelApproveStatus.APPROVED;
  //     hotel.is_verified = true;
  //     await this.dataSource.getRepository(Hotel).save(hotel);
  //   }

  //   if (hotel.is_verified === true) {
  //     throw new BadRequestException('Hotel Already Verified');
  //   }

  //   return {
  //     message: 'Hotel Verified! Please Login And Manage Your Property!',
  //   };
  // }

  async approveHotelAdminDetails(hotel_id: string) {
    // Find the hotel with the given ID
    const hotels = await this.dataSource
      .getRepository(Hotel)
      .find({ where: { id: hotel_id } });

    // Check if any hotels are found
    if (hotels.length === 0) {
      throw new BadRequestException('Hotel Not Found');
    }

    // Since find() returns an array, we assume the first result is the desired hotel
    const hotel = hotels[0];

    // Check if the hotel status is pending
    if (hotel.status === HotelApproveStatus.PENDING) {
      // Update the hotel status and verification status
      hotel.status = HotelApproveStatus.APPROVED;
      hotel.is_verified = true;

      // Save the updated hotel entity
      await this.dataSource.getRepository(Hotel).save(hotel);

      const title = 'Hotel Approved';
      const body = `You hotel has been approved by admin.`;

      const receiver = await this.dataSource
        .getRepository(User)
        .findOne({ where: { role: UserRole.hotel_admin } });

      await this.dataSource.getRepository(Notification).save({
        title: title,
        body: body,
        user_id: receiver.id,
        notification_type: NotificationType.message,
      });

      await this.firebaseService.sendPushNotifications([receiver.id], {
        title,
        body,
      });

      // Return success message
      return {
        message: 'Hotel Verified!',
      };
    }

    // Check if the hotel is already verified
    if (hotel.is_verified === true) {
      throw new BadRequestException('Hotel Already Approved');
    }

    // Return a message indicating that the hotel status is not pending
    throw new BadRequestException('Hotel Status is not Pending');
  }

  async removeHotelandHotelAdminDetails(user_id: string) {
    const user = await this.dataSource
      .getRepository(User)
      .createQueryBuilder('user')
      .where('user.id=:user_id', { user_id })
      .leftJoin('user.hotel', 'hotel')
      .leftJoin('hotel.user', 'user')
      .andWhere('user.id=:user_id', { user_id })
      .getOne();

    if (!user) throw new BadRequestException('Hotel owner not found');

    await this.dataSource.getRepository(User).delete(user.id);

    return { message: 'Hotel and hotel owner details deleted successfully' };
  }

  // ----------GET TOTAL HOTEL (SUPER ADMIN)------------
  getTotalHotel = () => {
    return this.dataSource.getRepository(Hotel).count();
  };

  //------------- GET TOTAL BOOKING (SUPER ADMIN)------------
  getTotalReservation = () => {
    return this.dataSource.getRepository(Reservation).count();
  };

  //------------- GET TOTAL Rooms (SUPER ADMIN)------------
  getTotalRoom = () => {
    return this.dataSource.getRepository(Rooms).count();
  };

  // ---------FIND ALL HOTEL ---------------
  async findAllHotels(options?: PaginationDto) {
    const take = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * take;

    // const data = await this.dataSource.getRepository(Hotel).findAndCount({
    //   take,
    //   skip,
    // });
    // return paginateResponse(data, page, take);

    const [hotels, total] = await this.dataSource
      .getRepository(Hotel)
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.user', 'user')
      .skip(skip)
      .take(take)
      .getManyAndCount();

    // Return paginated response containing hotels with their owners
    return { hotels, total, page, take };
  }

  // async deletehotelById(user_id: string, hotelId: string) {
  //   const hotel = await this.dataSource
  //     .getRepository(Hotel)
  //     .findOne({ where: { id: hotelId, user_id } });
  //   if (!hotel) throw new BadRequestException('Hotel Not Found.');

  //   await this.dataSource.getRepository(Hotel).remove(hotel);
  //   return { message: 'Hotel Deleted Sucessfullly!' };
  // }

  // -----------DELETE HOTEL By ID-------------------
  async deletehotelById(user_id: string, hotelId: string) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { id: hotelId, user_id }, relations: ['user'] });

    if (!hotel) throw new BadRequestException('Hotel Not Found.');

    // Delete the associated user (hotel admin)
    await this.dataSource.getRepository(User).delete(hotel.user.id);

    // Now delete the hotel
    await this.dataSource.getRepository(Hotel).remove(hotel);

    return { message: 'Hotel and associated User Deleted Successfully!' };
  }
}
