import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User, UserRole } from 'src/users/entities/user.entity';
import {
  CancelReservationDto,
  ChangeReservationStatus,
  CreateReservationDto,
  UpdateReservationDto,
} from './dto/reservation.dto';
import { DataSource } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { Rooms } from 'src/rooms/entities/rooms.entity';
import { Reservation, ReservationStatus } from './entities/reservation.entity';
import { sendMail } from 'src/@helpers/mail';
import { defaultMailTemplate } from 'src/@helpers/mail-templates/default.mail-template';
import { PaginationDto } from 'src/hotel/dto/pagination.dto';
import { paginateResponse } from 'src/@helpers/pagination';
import axios from 'axios';
import { KHALTI_SECRET_KEY } from 'src/@config/constants.config';
import {
  Payment,
  PaymentStatus,
  PaymentType,
} from 'src/payment/entities/payment.entity';

@Injectable()
export class ReservationService {
  private paymentLinkExpirationTime: number;

  constructor(private dataSource: DataSource) {}

  async makeHotelRoomsReservation(
    loggedUser: User,
    hotel_id: string,
    room_id: string,
    room_type: string,
    room_quantity: number,
    total_amount: number,
    checkInDate: string,
    checkOutDate: string,
    payload: CreateReservationDto,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const { email, confirm_email } = payload;
      if (!loggedUser)
        throw new UnauthorizedException(
          'Please login first to find best accommodation?',
        );
      if (!payload.full_name)
        throw new BadRequestException('Please provide your full name');
      if (!payload.country)
        throw new BadRequestException('Please provide your residence');
      if (!email && !confirm_email)
        throw new BadRequestException('Please Provide your Email');
      if (email != confirm_email) {
        throw new BadRequestException("Email doesn't match");
      }

      // Check if the hotel exits
      const hotel = await this.dataSource
        .getRepository(Hotel)
        .findOne({ where: { id: hotel_id } });

      if (!hotel) throw new NotFoundException('Hotel Not Found...');

      // check if the room exits
      const rooms = await queryRunner.manager
        .getRepository(Rooms)
        .findOne({ where: { id: room_id } });

      if (!rooms) throw new NotFoundException('Room Not Availiable');

      // Assign the user's email to the user_email property

      const user_email = email.toLowerCase();

      const reservation = await queryRunner.manager
        .getRepository(Reservation)
        .save({
          ...payload,
          user_email: user_email,
          total_amount: total_amount,
          check_In_Date: checkInDate,
          check_Out_Date: checkOutDate,
          user_id: loggedUser.id,
          room_type: room_type,
          room_quantity: room_quantity,
          hotel_id: hotel.id,
          room_id: rooms.id,
        });

      // -----------SEND MAIL IF BOOKING SUCCESSFULL----------------
      sendMail({
        to: payload.email,
        subject: 'Booking Sucessfull',
        html: defaultMailTemplate({
          title: 'Booking message',
          name: payload.full_name,
          message: `Your reservation is made successf ully!. <br/>
           Please continue your reservation process by making payment processing....`,
        }),
      });

      // Create Khalti payment
      const formData = {
        return_url: 'http://localhost:5173/my-reservation',
        website_url: 'http://localhost:5173',
        amount: total_amount,
        purchase_order_id: reservation.id,
        purchase_order_name: 'Hotel Reservation',
      };
      console.log('reach here');

      const redirect = await this.callKhalti(formData);

      await queryRunner.manager.getRepository(Payment).save({
        amount: formData.amount,
        khalti_token: '',
        khalti_mobile: '',
        payment_type: PaymentType.KHALTI,
        payment_status: PaymentStatus.COMPLETED,
        reservation_id: reservation.id,
        total_amount: total_amount + formData.amount,
      });

      reservation.status = ReservationStatus.APPROVED;
      // Logging after reservation approval

      // -----------SEND MAIL AFTER PAYMENT SUCCESSFULL----------------
      sendMail({
        to: reservation.email,
        subject: 'Booking Sucessfull',
        html: defaultMailTemplate({
          title: 'Booking message',
          name: payload.full_name,
          message: `Your reservation is made successfully in ${hotel.name}`,
        }),
      });

      await queryRunner.manager.getRepository(Reservation).save(reservation);
      await queryRunner.commitTransaction();
      return {
        message: 'Booked Sucessfully',
        reservation: reservation,
        redirect,
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

  private async callKhalti(formData: any) {
    try {
      // Check if the previous payment link has expired
      if (
        this.paymentLinkExpirationTime &&
        Date.now() > this.paymentLinkExpirationTime
      ) {
        // Generate a new payment link
        const newPaymentLink = await this.generateNewPaymentLink(formData);
        return newPaymentLink;
      }

      // Use the existing payment link
      const headers = {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.post(
        'https://a.khalti.com/api/v2/epayment/initiate/',
        formData,
        { headers },
      );
      console.log(response.data, 'response data');
      console.log(response.data.payment_url, 'payment url');

      // Set the expiration time of the new payment link (for example, 30 minutes from now)
      this.paymentLinkExpirationTime = Date.now() + 30 * 60 * 1000; // 30 minutes in milliseconds

      return response.data.payment_url;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error calling Khalti API',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private async generateNewPaymentLink(formData: any) {
    try {
      const headers = {
        Authorization: `Key ${KHALTI_SECRET_KEY}`,
        'Content-Type': 'application/json',
      };
      const response = await axios.post(
        'https://a.khalti.com/api/v2/epayment/initiate/',
        formData,
        { headers },
      );
      console.log(response.data, 'response data');
      console.log(response.data.payment_url, 'payment url');

      // Set the expiration time of the new payment link (for example, 30 minutes from now)
      this.paymentLinkExpirationTime = Date.now() + 30 * 60 * 1000;

      return response.data.payment_url;
    } catch (error) {
      console.error(error);
      throw new HttpException(
        'Error calling Khalti API',
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  // --------APPROVE RESERVATION--------------
  async approveRoomReservation(user: User, reservation_id: string) {
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findOne({ where: { id: reservation_id }, relations: ['user'] });
    if (!reservation) throw new BadRequestException('Reservation Not found..');

    // Check if reservation is of the same hotel
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user.id } });
    if (!hotel) throw new BadRequestException('Hotel Not Found..');

    if (reservation.hotel_id !== hotel.id)
      throw new BadRequestException('Reservation is not of this Hotel...');

    reservation.status = ReservationStatus.APPROVED;

    const customer = reservation.user;
    sendMail({
      to: customer.email,
      subject: 'Approve Reservation',
      html: defaultMailTemplate({
        title: 'Approve Reservation',
        name: user.full_name,
        message: `Your Reservation is ${reservation.status}`,
      }),
    });
    const approveReservation = await this.dataSource
      .getRepository(Reservation)
      .save(reservation);
    return { message: 'Approve Sucessfully', reservation: approveReservation };
  }

  // ---------- GET ALL RESERVATIONS(CUSTOMER) ----------
  async getMyReservation(loggedUser: User, options?: PaginationDto) {
    // check if the shop exists.
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: loggedUser.id } });
    if (!user)
      throw new BadRequestException('Please Login to view reservation.');

    const page = options?.page || 1;
    const take = options?.limit || 5;
    const skip = (page - 1) * take;

    // check if reservaton exots..
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findAndCount({
        where: { user_id: user.id },
        relations: { hotel: true, rooms: true },
        select: {
          id: true,
          note: true,
          start_Time: true,
          phone_number: true,
          user_email: true,
          status: true,
          hotel: {
            id: true,
            avatar: true,
            name: true,
          },
          rooms: {
            id: true,
            images: true,
            room_name: true,
          },
        },
        skip,
        take,
      });
    if (!reservation) throw new BadRequestException('Reservation Not Found');

    return paginateResponse(reservation, page, take);
  }

  // -------------GET RESERVATION-----------------
  async getReservation(user: User) {
    console.log(user, 'Users');
    if (!user)
      throw new BadRequestException('User not found to get reservatiion?');
    return await this.dataSource
      .getRepository(Reservation)
      .createQueryBuilder('reservation')
      .leftJoinAndSelect('reservation.hotel', 'hotel')
      .where('reservation.user_id =:userId', { userId: user.id })
      .getMany();
  }

  // ---------- GET ALL RESERVATIONS(HOTEL-ADMIN) ----------
  async getAllReservation(loggedUser: User, options?: PaginationDto) {
    const page = options?.page || 1;
    const take = options?.limit || 10;
    const skip = (page - 1) * take;

    // check if the hotel exits.
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: loggedUser.id, role: UserRole.hotel_admin } });
    if (!user)
      throw new BadRequestException('Please Login to view reservation');

    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user.id } });
    if (!hotel) throw new BadRequestException('Hotel Not Found');

    // const reservation = await this.dataSource
    //   .getRepository(Reservation)
    //   .findAndCount({ take, skip });

    // if (!reservation) throw new BadRequestException('Reservation Not Found.');
    // return paginateResponse(reservation, page, take);

    // Get reservations for the specific hotel.
    const [reservations, total] = await this.dataSource
      .getRepository(Reservation)
      .findAndCount({
        where: { hotel_id: hotel.id },
        take,
        skip,
      });

    if (!reservations.length)
      throw new BadRequestException('No reservations found.');

    return paginateResponse({ data: reservations, total }, page, take);
  }

  // ---------UPDATE RESERVATION (HOTEL ADMIN)-----------
  async updateReservation(
    reservation_id: string,
    payload: UpdateReservationDto,
  ) {
    // check if reservation exists
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findOne({
        where: { id: reservation_id },
      });

    if (!reservation)
      throw new NotFoundException(
        `Reservation not found with id ${reservation_id}`,
      );

    return await this.dataSource
      .getRepository(Reservation)
      .update(reservation_id, { ...payload });
  }

  // ---------- UPDATE A RESERVATION (CUSTOMER)----------

  async updateMyReservation(
    reservation_id: string,
    loggedUser: User,
    payload: UpdateReservationDto,
  ) {
    // check if both user and shop exists
    const user = await this.dataSource
      .getRepository(User)
      .findOne({ where: { id: loggedUser.id } });
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { id: payload.hotel_id } });

    if (!user && !hotel) throw new NotFoundException('Not found');

    // check if reservation exists
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findOne({
        where: {
          id: reservation_id,
          status: ReservationStatus.PENDING,
          user_id: user.id,
          hotel_id: hotel.id,
        },
      });

    if (!reservation) throw new NotFoundException('Reservation Not found');

    //  Check if reservation status is APPROVED
    if (
      reservation.status === ReservationStatus.APPROVED ||
      reservation.status === ReservationStatus.CANCELLED
    ) {
      throw new BadRequestException('Cannot update reservation at the moment');
    }

    return await this.dataSource
      .getRepository(Reservation)
      .update(reservation_id, {
        ...payload,
        status: ReservationStatus.PENDING,
      });
  }

  // ---------- CHANGE ORDER STATUS (SELLER) -------------

  async changeReservationStatus(
    user_id: string,
    reservation_id: string,
    payload: ChangeReservationStatus,
  ) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });

    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findOne({
        where: { id: reservation_id, hotel_id: hotel.id },
      });

    if (!reservation) {
      return { message: 'You are not authorized.' };
    }

    await this.dataSource.getRepository(Reservation).save({
      id: reservation_id,
      order_status: payload.reservation_status,
      cancelled_reason: payload.cancelled_reason
        ? payload.cancelled_reason
        : null,
    });
  }

  // ---------- DELETE RESERVATION (HOTEL ADMIN) ----------
  async deleteReservation(reservation_id: string) {
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findOne({ where: { id: reservation_id } });

    if (!reservation)
      throw new BadRequestException(
        'Reservation not found with status code: 400',
      );
    await this.dataSource.getRepository(Reservation).delete(reservation_id);
    return {
      message: 'Your Reservation deleted successfully',
      deleteReservation: reservation,
    };
  }

  //-------- CANCEL RESERVATION (CUSTOMER)--------------
  async cancelReservation(
    user_id: string,
    reservation_id: string,
    payload: CancelReservationDto,
  ) {
    const reservation = await this.dataSource
      .getRepository(Reservation)
      .findOne({ where: { id: reservation_id }, relations: ['hotel'] });

    if (!reservation) throw new BadRequestException('Reservation Not Found..');

    const reservationStatus = reservation.status;

    if (reservationStatus !== ReservationStatus.APPROVED) {
      throw new BadRequestException(
        `Reservation can't be cancelled. current status: ${reservationStatus} `,
      );
    }

    const cancelledReservation = await this.dataSource
      .getRepository(Reservation)
      .save({
        id: reservation_id,
        user_id: user_id,
        reservation_status: ReservationStatus.CANCELLED,
        cancelled_reason: payload.reason,
      });

    return {
      message: 'Reservation Cancelled Sucessfully',
      cancelReservation: cancelledReservation,
    };
  }

  async generateCustomerReport(
    book_id: string,
    user_id: string,
    check_In_Date: string,
  ) {
    try {
      const reservation = await this.dataSource
        .getRepository(Reservation)
        .createQueryBuilder('reservation')
        .leftJoinAndSelect('reservation.hotel', 'hotel')
        .leftJoinAndSelect('reservation.user', 'user')
        .where('reservation.id =:book_id', { book_id })
        .andWhere('reservation.user_id =:user_id', { user_id })
        .andWhere('reservation.check_In_Date =:check_In_Date', {
          check_In_Date,
        })
        .getOne();
      return reservation;
    } catch (error) {
      console.log(error);
    }
  }
}
