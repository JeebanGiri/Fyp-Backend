/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  CreateHotelDto,
  SetLocationDto,
  UpdateHotelDto,
} from './dto/hotel.dto';
import { DataSource } from 'typeorm';
import { Hotel, HotelApproveStatus } from './entities/hotel.entity';
import { Point } from 'geojson';
import slugify from 'slugify';
import * as fs from 'fs';
import { User, UserRole } from 'src/users/entities/user.entity';
import { Logger } from '@nestjs/common';

@Injectable()
export class HotelService {
  constructor(
    private dataSource: DataSource,
    private readonly logger: Logger,
  ) {}

  // ----------------REGISTER HOTEL------------------
  async registerHotel(
    user_id: string,
    payload: CreateHotelDto,
    files: Express.Multer.File[],
  ) {
    // Validate uploaded files
    if (!files)
      throw new BadRequestException('Upload "avatar"* and "cover" files');

    if (!files['avatar']) throw new BadRequestException('Avatar is required');
    if (!files['documents'])
      throw new BadRequestException('Documents are required');

    payload.avatar = files['avatar'][0].filename;

    payload.documents = [];
    files['documents'].forEach((document) => document.filename);

    if (files['cover']) {
      payload.cover = files['cover'][0].filename;
    }

    const { hotel_name, ...res } = payload;

    //Check if user already has a hotel
    const hotelExist = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id } });
    if (hotelExist) throw new BadRequestException('User already have a Hotel');

    const slug = slugify(hotel_name, { lower: true });

    const hotel = await this.dataSource.getRepository(Hotel).save({
      ...res,
      hotel_name,
      slug,
      user_id,
    });

    return { message: 'Hotel registered successfully.', hotel };
  }

  // ----------ADD HOTEL LOCATION------------
  async addLocation(user: User, hotel_id: string, payload: SetLocationDto) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { id: hotel_id, user_id: user.id } });
    if (!hotel) throw new BadRequestException('Hotel Not Found!');

    const { latitude, longitude } = payload;
    if (!payload)
      throw new BadRequestException('Latitude and Longitude is unable to set!');

    const location: Point = {
      type: 'Point',
      coordinates: [longitude, latitude],
    };

    // Update the location property with the new coordinates
    hotel.location = location;

    // Save the updated hotel with the new location
    await this.dataSource.getRepository(Hotel).save(hotel);
    return { message: 'Hotel Location Added Sucessfully!' };
  }

  //---------------------UPDATE HOTEL-------------------
  async updateHotel(
    user: User,
    hotel_id: string,
    payload: UpdateHotelDto,
    files?: Express.Multer.File[],
  ) {
    // Get the hotel
    const where = { id: hotel_id };

    if (user.role === UserRole.super_admin) {
      Object.assign(where, { user_id: user.id });
    }
    const hotel = await this.dataSource.getRepository(Hotel).findOne({ where });
    if (!hotel) throw new BadRequestException('Hotel Not Found');

    if (payload.avatar) {
      payload.avatar = null;
    }
    if (payload.cover) {
      payload.cover = null;
    }
    if (payload.documents) {
      payload.documents = null;
    }
    if (files) {
      if (files['avatar']) {
        payload.avatar = files['avatar'][0].filename;
        // Delete old avatar
        const path = hotel.avatar.slice(1);
        fs.unlinkSync(path);
      }
      if (files['cover']) {
        payload.cover = files['cover'][0].filename;

        // Delete Old Cover
        const path = hotel.cover.slice(1);
        fs.unlinkSync(path);
      }
      if (files['documents'] && files['documents'].length > 0) {
        payload.documents = [];
        files['documents'].forEach((documentFile) => {
          const documentPath = documentFile.filename;
          payload.documents.push(documentPath);
        });
      }
    }
    if (payload.hotel_name) {
      payload['slug'] = slugify(payload.hotel_name, { lower: true });
    }
    // if (payload.latitude && payload.longitude) {
    //   payload['location'] = {
    //     type: 'Point',
    //     coordinates: [payload.latitude, payload.longitude],
    //   };
    // }

    if (payload.checkin_checkout) {
      payload['checkin_checkout'] = {
        ...hotel.checkin_checkout,
        ...payload.checkin_checkout,
      };
    }

    Object.assign(hotel, payload);
    const updatedHotel = await this.dataSource
      .getRepository(Hotel)
      .save({ ...hotel, ...payload });

    return { message: 'Hotel updated successfully.', hotel: updatedHotel };
  }

  // ------FIND HOTEL BY ID-------
  async findHotel(hotel_id: string) {
    return await this.dataSource
      .getRepository(Hotel)
      .find({ where: { id: hotel_id } });
  }

  // ---------- SEARCH HOTEL BY NAME ----------
  async getHotelByName(hotelName: string) {
    console.log(hotelName);
    return await this.dataSource
      .getRepository(Hotel)
      .createQueryBuilder()
      .select()
      .where('name ILike :hotelName', { hotelName: `%${hotelName}%` })
      .getMany();
  }

  //----------GET HOTEL BY LOCATION--------------
  async getHotelByLocation(
    address: string,
    minPrice?: number,
    maxPrice?: number,
  ) {
    try {
      console.log(address, 'address received');
      let query = this.dataSource
        .getRepository(Hotel)
        .createQueryBuilder('hotel')
        .leftJoinAndSelect('hotel.rooms', 'rooms')
        .where('hotel.address ILike :address', { address: `%${address}%` })
        .andWhere('hotel.status = :status', {
          status: HotelApproveStatus.APPROVED,
        });

      if (minPrice !== undefined && maxPrice !== undefined) {
        query = query.andWhere(
          '(rooms.room_rate BETWEEN :minPrice AND :maxPrice OR rooms.id IS NULL)',
          { minPrice, maxPrice },
        );
      }

      const hotels = await query.getMany();
      console.log(hotels, 'Hotel extract');

      if (!hotels || hotels.length === 0) {
        this.logger.warn(`No hotels found for address: ${address}`);
        console.log('not Found hotel in ktm');

        return [];
      }

      // Extract details of only one room per hotel
      const hotelsWithOneRoom = hotels.map((hotel) => ({
        ...hotel,
        rooms: hotel.rooms.length > 0 ? [hotel.rooms[0]] : [], // Get details of only one room per hotel
      }));

      return hotelsWithOneRoom;
    } catch (error) {
      this.logger.error(`Error fetching hotels by address: ${error.message}`);
      throw error;
    }
  }

  // ---------------GET HOTEL WITH ROOMS INFO---------------
  async getHotelByNameWithRooms(hotelName: string) {
    return await this.dataSource
      .getRepository(Hotel)
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'rooms')
      .where('hotel.name ILike :hotelName', { hotelName: `%${hotelName}%` })
      .getMany();
  }

  //-----------Filter the hotel by location, echck-in date and check_out date--------------
  async filteredHotels(address: string, check_in: string, check_out: string) {
    const filterHotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { address: address } });
    return filterHotel;
  }

  //--------------- GET HOTEL LOCATION-------------
  async getHotelLocation(hotel_id: string) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { id: hotel_id } });
    if (!hotel) throw new NotFoundException('Location Not Found');

    return hotel;
  }

  // --------------GET ALL ROOMS------------------
  async findAllRooms(user_id: string, hotel_id: string) {
    return await this.dataSource
      .getRepository(Hotel)
      .createQueryBuilder('hotel')
      .leftJoinAndSelect('hotel.rooms', 'rooms')
      .where('hotel.user_id = :user_id', { user_id })
      .andWhere('rooms.hotel_id = :hotel_id', { hotel_id })
      .getMany();
  }

  //-------- Get Hotel By Admin Hotel-----------
  async getMyHotel(user_id: string) {
    const data = await this.dataSource.getRepository(Hotel).find({
      where: { user_id: user_id },
      select: [
        'id',
        'name',
        'address',
        'phone_number',
        'checkin_checkout',
        'status',
        'rating_value',
        'avatar',
      ],
    });
    if (!data) throw new BadRequestException('Hotel Not Found');
    return data;
  }

  // -----------DELETE HOTEL By ID-------------------
  async deletehotelById(user_id: string, hotelId: string) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { id: hotelId, user_id } });
    if (!hotel) throw new BadRequestException('Hotel Not Found.');

    await this.dataSource.getRepository(Hotel).remove(hotel);
    return { message: 'Hotel Deleted Sucessfullly!' };
  }
}
