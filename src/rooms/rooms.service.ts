import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateRoomDto, UpdateRoomDto } from './dto/rooms.dto';
import { DataSource } from 'typeorm';
import { Hotel } from 'src/hotel/entities/hotel.entity';
import { RoomAvailiability, RoomType, Rooms } from './entities/rooms.entity';
import { User, UserRole } from 'src/users/entities/user.entity';
import * as fs from 'fs';
import { PaginationDto } from 'src/hotel/dto/pagination.dto';
import { paginateResponse } from 'src/@helpers/pagination';
import { FirebaseService } from 'src/firebase/firebase.service';
import {
  Notification,
  NotificationType,
} from 'src/notification/entities/notification.entity';

@Injectable()
export class RoomsService {
  constructor(
    private dataSource: DataSource,
    private readonly firebaseService: FirebaseService,
  ) {}

  // --------------ADD HOTELS ROOMS-----------------
  async addRooms(
    user_id: string,
    payload: CreateRoomDto,
    hotel_id: string,
    files: Express.Multer.File[],
  ) {
    try {
      if (!files)
        throw new BadRequestException('Upload an Image of the rooms.');
      if (!files['images'])
        throw new BadRequestException('Room Images are required');

      const hotel = await this.dataSource
        .getRepository(Hotel)
        .findOne({ where: { id: hotel_id, user_id: user_id } });

      if (!hotel)
        throw new BadRequestException('Hotel Not Found... for adding rooms..');

      if (hotel) {
        console.log('Image inside');
        if (!files['images'])
          throw new BadRequestException('Upload "Images" of the rooms.');

        const roomimg = (payload.images = files['images'].map(
          (image) => image.filename,
        ));

        await this.validateRoomNumberUniqueness(payload.room_number, hotel.id);
        const saveRooms = await this.dataSource.getRepository(Rooms).save({
          room_name: payload.room_name,
          room_number: payload.room_number,
          room_type: payload.room_type,
          room_rate: payload.room_rate,
          room_capacity: payload.room_capacity,
          images: roomimg,
          user_id: user_id,
          hotel_id: hotel.id,
        });

        await this.dataSource.getRepository(Rooms).save(saveRooms);
        const title = 'Add Room';
        const body = 'Room is Added Successfully.';

        await this.dataSource.getRepository(Notification).save({
          title: title,
          body: body,
          user_id: user_id,
          notification_type: NotificationType.message,
        });

        const receiver = await this.dataSource
          .getRepository(User)
          .findOne({ where: { role: UserRole.super_admin } });

        await this.firebaseService.sendPushNotifications([receiver.id], {
          title,
          body,
        });

        return { message: 'Room Added Successfully!' };
      }
    } catch (error) {
      console.log(error);
    }
  }

  // --------- UPDATE ROOM DETAILS -----------
  async updateRooms(
    user: User,
    room_id: string,
    payload: UpdateRoomDto,
    files: Express.Multer.File[],
  ) {
    const where = { id: room_id };

    if (user.role === UserRole.super_admin) {
      Object.assign(where, { user_id: user.id });
    }
    const hotel = await this.dataSource
      .getRepository(Rooms)
      .createQueryBuilder('rooms')
      .leftJoinAndSelect('rooms.hotel', 'hotel')
      .getOne();

    const roomInfo = await this.dataSource
      .getRepository(Rooms)
      .findOne({ where });

    if (!roomInfo)
      throw new NotFoundException(
        'Room not found or user does not have permission to update.',
      );

    if (payload.room_number) {
      await this.validateRoomNumberUniqueness(payload.room_number, hotel.id);
    }

    if (files && files['images'] && files['images'].length > 0) {
      payload.images = files['images'].map((imageFile) => {
        const filePath = imageFile.filename;

        // Delete old image file
        const imageIndex = roomInfo.images.findIndex(
          (oldImage) => oldImage === imageFile.originalname,
        );
        if (imageIndex !== -1) {
          const oldDocumentPath = roomInfo.images[imageIndex].slice(1);
          fs.unlinkSync(oldDocumentPath);
        }
        return filePath;
      });
    }

    if (roomInfo) {
      Object.assign(roomInfo, payload);
    }
    await this.dataSource
      .getRepository(Rooms)
      .save({ ...roomInfo, ...payload });

    const title = 'Update Room';
    const body = 'Room Updated Successfully!';

    await this.dataSource.getRepository(Notification).save({
      title: title,
      body: body,
      user_id: user.id,
      notification_type: NotificationType.message,
    });

    const receiver = await this.dataSource
      .getRepository(User)
      .findOne({ where: { role: UserRole.super_admin } });

    await this.firebaseService.sendPushNotifications([receiver.id], {
      title,
      body,
    });

    return { message: 'Room Updated Successfully' };
  }

  // --------ROOM NUMBER VALIDATION-------------
  async validateRoomNumberUniqueness(roomNumber: number, hotelId: string) {
    if (isNaN(roomNumber)) {
      throw new BadRequestException('Room number must be a valid number.');
    }
    if (!hotelId)
      throw new BadRequestException('Hotel not found to add the rooms.');

    const existingRoom = await this.dataSource
      .getRepository(Rooms)
      .findOne({ where: { room_number: roomNumber, hotel_id: hotelId } });

    if (existingRoom) {
      throw new BadRequestException('Room with this number already exists.');
    }
  }

  // ---------GET HOTEL ROOMS-----------
  async getRoomsByHotelId(
    user_id: string,
    hotel_id: string,
    options?: PaginationDto,
  ) {
    const take = options?.limit || 1;
    const page = options?.page || 1;
    const skip = (page - 1) * take;
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });
    if (hotel) {
      const rooms = await this.dataSource.getRepository(Rooms).findAndCount({
        where: { hotel_id: hotel_id },
        select: [
          'room_name',
          'room_type',
          'room_capacity',
          'room_rate',
          'hotel_id',
          'images',
        ],
        take: take,
        skip: skip,
      });

      if (!rooms)
        throw new BadRequestException('Rooms are Not Found in this hotel');

      return paginateResponse(rooms, page, take);
    }
  }

  // ---------GET HOTEL ROOM By Id-----------
  async getRoomsByRoomId(room_id: string) {
    // const rooms = await this.dataSource.getRepository(Rooms).findAndCount({
    //   where: { id: room_id },
    //   select: [
    //     'room_name',
    //     'room_type',
    //     'room_capacity',
    //     'room_rate',
    //     'hotel_id',
    //     'images',
    //   ],
    // });

    const rooms = await this.dataSource
      .getRepository(Rooms)
      .findOne({ where: { id: room_id } });

    if (!rooms)
      throw new BadRequestException('Rooms are Not Found in this hotel');

    return rooms;
  }

  // ---------------GET TOTAL ROOMS BY ROOMTYPE------------
  async getTotalRoomsByType(roomType: RoomType) {
    const totalRooms = await this.dataSource
      .getRepository(Rooms)
      .createQueryBuilder('rooms')
      .where('rooms.room_type = :roomType', { roomType })
      .andWhere('rooms.room_status = :status', {
        status: RoomAvailiability.AVAILABLE,
      })
      .getCount();
    return totalRooms;
  }

  // --------------FIND ROOM AVAILIABILITY--------------
  async findRoomAvailiability(hotel_id: string) {
    const hotelRoom = await this.dataSource
      .getRepository(Rooms)
      .createQueryBuilder('rooms')
      .leftJoinAndSelect('rooms.hotel', 'hotel')
      .where('hotel.id =:hotel_id', { hotel_id })
      .andWhere('rooms.room_status = :status', {
        status: RoomAvailiability.AVAILABLE,
      })
      .getCount();
    if (hotelRoom === 0)
      throw new NotFoundException('Sorry! No rooms are availiables.');
    return hotelRoom;
  }

  // -----------GET ROOM BY TYPES---------------
  async getRoomByTypes(room_type: RoomType, hotel_id: string) {
    const filteredRoom = await this.dataSource
      .getRepository(Rooms)
      .createQueryBuilder('rooms')
      .leftJoinAndSelect('rooms.hotel', 'hotel')
      .where('rooms.room_type =:roomType', { roomType: room_type })
      .andWhere('hotel.id =:hotelId', { hotelId: hotel_id })
      .andWhere('rooms.room_status = :status', {
        status: RoomAvailiability.AVAILABLE,
      })
      .getOne();

    if (filteredRoom == null) {
      throw new BadRequestException(
        'Room with this varient is not availiable to book!',
      );
    }
    return filteredRoom;
  }

  // -------Find Rooms By Hotel ID--------
  async getRoomsFromHotelId(hotel_id: string) {
    return await this.dataSource
      .getRepository(Rooms)
      .createQueryBuilder('rooms')
      .leftJoinAndSelect('rooms.hotel', 'hotel')
      .andWhere('hotel.id =:hotelId', { hotelId: hotel_id })
      .andWhere('rooms.room_status = :status', {
        status: RoomAvailiability.AVAILABLE,
      })
      .getOne();
  }

  // -------GET ALL REGISTERED ROOMS------------
  async findRegisteredRooms(user_id: string, options?: PaginationDto) {
    const take = options?.limit || 10;
    const page = options?.page || 1;
    const skip = (page - 1) * take;
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });
    const rooms = await this.dataSource.getRepository(Rooms).findAndCount({
      where: { hotel_id: hotel.id },
      select: [
        'id',
        'room_name',
        'room_number',
        'room_capacity',
        'room_rate',
        'room_type',
        'images',
        'hotel_id',
      ],
      take: take,
      skip: skip,
    });
    if (!rooms) throw new BadRequestException('Rooms Not Found');
    return paginateResponse(rooms, page, take);
  }

  //----------- SEARCH ROOMS BY NAME AND NUMBER----------------
  async searchRoom(room_name: string, room_number: number) {
    return await this.dataSource
      .getRepository(Rooms)
      .createQueryBuilder()
      .select()
      .where('room_name Ilike :room_name', { room_name: `${room_name}` })
      .andWhere('room_number Ilike :room_number', {
        room_number: `${room_number}`,
      })
      .getMany();
  }

  // --------------FIND ALL Rooms---------------
  async findAllRooms(user: User, hotel_id: string) {
    try {
      return await this.dataSource
        .getRepository(Rooms)
        .createQueryBuilder('room')
        .leftJoinAndSelect('room.hotel', 'hotel')
        .where('hotel.user_id = :user_id', { user_id: user.id })
        .andWhere('room.room_status = :status', {
          status: RoomAvailiability.AVAILABLE,
        })
        .andWhere('room.hotel_id = :hotel_id', { hotel_id })
        .getMany();
    } catch (error) {
      // Handle any errors that might occur during query execution
      console.error('Error finding rooms:', error);
      throw new Error('An error occurred while fetching rooms.');
    }
  }

  // -------- DELETE SPECIFIC ROOMS ------------

  async removeRoomByRoomId(user_id: string, room_id: string) {
    const userHotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { id: user_id } });
    if (userHotel) {
      const rooms = await this.dataSource
        .getRepository(Rooms)
        .findOne({ where: { id: room_id } });

      if (!rooms) throw new BadRequestException('Rooms Not Found');

      const deletedRooms = await this.dataSource
        .getRepository(Rooms)
        .remove(rooms);
      return { message: 'Rooms Deleted Sucessfully', HotelRooms: deletedRooms };
    }
  }

  // --------------REMOVE ALL ROOMS BY HOTELID---------------------
  async removeRoomByHotelID(user_id: string, hotel_id: string) {
    const hotel = await this.dataSource
      .getRepository(Hotel)
      .findOne({ where: { user_id: user_id } });
    if (hotel) {
      const [roomInfo, totalCount] = await this.dataSource
        .getRepository(Rooms)
        .findAndCount({ where: { hotel_id: hotel_id } });

      if (totalCount === 0) {
        throw new BadRequestException('Rooms Not Found..');
      }
      const deletedRooms = await this.dataSource
        .getRepository(Rooms)
        .remove(roomInfo);
      return { message: 'Room Deleted Sucessfully', rooms: deletedRooms };
    }
  }
}
