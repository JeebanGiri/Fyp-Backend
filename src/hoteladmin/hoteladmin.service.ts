import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  LoginHotelAdminDto,
  RegisterHotelAdminDto,
} from './dto/hoteladmin.dto';
import { DataSource, Point } from 'typeorm';
import { User, UserRole } from 'src/users/entities/user.entity';
import * as argon from 'argon2';
import { OtpService } from 'src/otp/otp.service';
import { OTPType } from 'src/otp/entities/otp.entity';
import { sendMail } from 'src/@helpers/mail';
import { defaultMailTemplate } from 'src/@helpers/mail-templates/default.mail-template';
import { JwtService } from '@nestjs/jwt';
import { Hotel, HotelApproveStatus } from 'src/hotel/entities/hotel.entity';
import slugify from 'slugify';
import { CreateHotelDto, UpdateHotelDto } from 'src/hotel/dto/hotel.dto';
import { HotelAdminDocumentDetails } from './entities/hoteladmin-document-details';
import { HotelAdminPaymentDetails } from './entities/hoteladmin-payment-details';
import { RoomAvailiability, Rooms } from 'src/rooms/entities/rooms.entity';
import { Reservation } from 'src/reservation/entities/reservation.entity';

@Injectable()
export class HotelAdminService {
  constructor(
    private dataSource: DataSource,
    private otpService: OtpService,
    private jwtService: JwtService,
  ) {}

  // ---------- REGISTER Hotel Admin----------
  async register(payload: RegisterHotelAdminDto) {
    const { email, password, ...res } = payload;
    console.log(payload);

    const emailExists = await this.dataSource
      .getRepository(User)
      .findOne({ where: { email } });

    if (emailExists)
      throw new BadRequestException({
        error: { message: 'Email already exits..' },
      });

    // Register new user
    const { ...savedUser } = await this.dataSource.getRepository(User).save({
      email,
      password: await argon.hash(password),
      role: UserRole.hotel_admin,
      ...res,
    });

    console.log('Reach');

    // Generate and send OTP
    const otp = await this.otpService.createOtp(
      savedUser.id,
      OTPType.emailVerification,
    );
    console.log('otp', otp);

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

  //-----------LOGIN HOTEL ADMIN ------------

  async login(payload: LoginHotelAdminDto) {
    const { email, password } = payload;

    const user = await this.dataSource.getRepository(User).findOne({
      where: { email },
      select: ['id', 'is_verified', 'password', 'role'],
    });

    if (!user)
      throw new UnauthorizedException({
        error: { message: 'Invalid Email.' },
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

  // --------REGISTER HOTEL -------------
  async registerHotel(
    user_id: string,
    payload: CreateHotelDto,
    files: Express.Multer.File[],
  ) {
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
    const hotelExist = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });
    if (hotelExist) throw new BadRequestException('User already have a Hotel');

    const { account_name, account_number, bank_name, branch_name, ...res } =
      payload;
    const hotel = new Hotel();
    hotel.name = payload.hotel_name;
    hotel.address = payload.address;
    hotel.cover = payload.cover;
    hotel.phone_number = payload.phone_number;
    hotel.avatar = payload.avatar;
    hotel.documents = payload.documents;
    hotel.is_verified = true;
    // hotel.status = HotelApproveStatus.APPROVED;
    hotel.user_id = user_id;
    hotel.description = payload.description;
    await this.dataSource.getRepository(Hotel).save(hotel);

    // create document details of the Hotel Admin
    await this.dataSource.manager
      .getRepository(HotelAdminDocumentDetails)
      .save({
        ...payload,
        user_id: user_id,
        hotel_id: hotel.id,
      });

    // create bank details of the Hotel Admin
    await this.dataSource.manager.getRepository(HotelAdminPaymentDetails).save({
      user_id: user_id,
      hotel_id: hotel.id,
      account_name,
      account_number,
      bank_name,
      branch_name,
      ...res,
    });
    return {
      message:
        'Hotel Details has been added successfully! Please wait for Super Admin Approval.',
      hotel,
    };
  }

  // ------------GET HOTEL ADMIN DETAILS--------------
  async getMyHotelDetails(user: User) {
    return this.dataSource
      .getRepository(Hotel)
      .find({ where: { user_id: user.id } });
  }

  async editHotelDetails(
    user_id: string,
    hotel_id: string,
    payload: UpdateHotelDto,
    files: Express.Multer.File[],
  ) {
    // Get the hotel of the hotel admin
    const hotel = await this.dataSource.manager.getRepository(Hotel).findOne({
      where: {
        id: hotel_id,
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

  // -----------GET TOTAL REGISTERED ROOMS---------------
  async getTotalRooms(user: User) {
    console.log(user.id);
    if (!user) throw new BadRequestException('Hotel Not Found!');

    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user.id } });

    if (hotel) {
      const rooms = await this.dataSource.getRepository(Rooms).findOne({
        where: {
          hotel_id: hotel.id,
          room_status: RoomAvailiability.AVAILABLE,
        },
      });
      if (!rooms) throw new BadRequestException('Rooms not Found.');
      return await this.dataSource.getRepository(Rooms).count();
    }
  }

  // -----------GET TOTAL Rating---------------
  async findTotalRating(user_id: string) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });

    if (!hotel) throw new BadRequestException('Hotel not found.');
    const rating = hotel.rating_value;
    return rating;
  }

  // -----------GET TOTAL INCOME---------
  async findTotalIncome(user_id: string) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });
    if (!hotel) throw new BadRequestException('Hotel Not Found');
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .find({ where: { hotel_id: hotel.id } });
    if (!reservation)
      throw new BadRequestException(
        'Your Hotel is not reserved by anyone yet!',
      );
    const totalIncome = reservation.reduce((total, reservation) => {
      return total + reservation.total_amount;
    }, 0);

    return totalIncome;
  }

  // ----------GET ALL CUSTOMER------------ -
  async findTotalCustomer(user_id: string) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });
    if (!hotel) throw new BadRequestException('Hotel Not Found!');
    const reservations = await this.dataSource
      .getRepository(Reservation)
      .find({ where: { hotel_id: hotel.id } });
    return reservations;
    // const customer_id = reservations.map((customer) => customer.user_id);
    // const uniqueCustomerIds = Array.from(
    //   new Set(reservations.map((reservation) => reservation.customer_id)),
    // );
    // return uniqueCustomerIds;
  }

  async getTotalBooking(user_id: string) {
    if (!user_id) throw new BadRequestException('User Not Found..');
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });

    if (!hotel) throw new BadRequestException('Hotel Not Found');
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findAndCount({ where: { hotel_id: hotel.id } });
    console.log(reservation);
    return reservation;
  }
}
