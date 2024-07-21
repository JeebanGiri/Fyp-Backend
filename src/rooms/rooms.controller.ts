import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { GetUser } from 'src/@decorators/getUser.decorator';
import { Roles } from 'src/@decorators/roles.decorator';
import { imageFileFilter, filename } from 'src/@helpers/storage';

import { User, UserRole } from 'src/users/entities/user.entity';
import { CreateRoomDto, UpdateRoomDto } from './dto/rooms.dto';
import { RoomsService } from './rooms.service';
import { RoomAvailiability, RoomType } from './entities/rooms.entity';
import { SchedulerRegistry } from '@nestjs/schedule';

@ApiTags('Rooms')
@Controller('rooms')
export class RoomsController {
  constructor(
    private roomService: RoomsService,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  @Post('register/:hotel_id')
  @ApiOperation({
    summary: 'Add a new Rooms',
    description: `${UserRole.super_admin}`,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 10 }], {
      storage: diskStorage({
        destination: 'static/rooms',
        filename,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  @ApiConsumes('application/json')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT_auth')
  @Roles(UserRole.super_admin, UserRole.hotel_admin)
  registerRooms(
    @GetUser('id') user_id: string,
    @Body() payload: CreateRoomDto,
    @Param('hotel_id') hotel_id: string,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.roomService.addRooms(user_id, payload, hotel_id, files);
  }

  @Patch(':room_id')
  @ApiOperation({
    summary: 'Update Room Details',
    description: `${UserRole.super_admin}`,
  })
  @UseInterceptors(
    FileFieldsInterceptor([{ name: 'images', maxCount: 5 }], {
      storage: diskStorage({
        destination: 'static/rooms',
        filename,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  @ApiConsumes('application/json')
  @ApiConsumes('miltipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT_auth')
  @Roles(UserRole.super_admin, UserRole.hotel_admin)
  updateRooms(
    @GetUser() user: User,
    @Param('room_id') room_id: string,
    @Body() payload: UpdateRoomDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.roomService.updateRooms(user, room_id, payload, files);
  }

  // ---------GET ROOMS BY HOTEL ID -----------
  @Get(':hotel_id')
  @ApiOperation({
    summary: 'Get All Hotel Rooms',
    description: `${UserRole.hotel_admin && UserRole.super_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin && UserRole.super_admin)
  getAllRooms(
    @GetUser('id') user_id: string,
    @Param('hotel_id') hotel_id: string,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.roomService.getRoomsByHotelId(user_id, hotel_id, {
      page,
      limit,
    });
  }

  // ---------GET ROOMS BY Room ID -----------
  @Get('/find-room/:room_id')
  @ApiOperation({
    summary: 'Get All Hotel Rooms',
    description: `${UserRole.hotel_admin && UserRole.super_admin}`,
  })
  @Roles(UserRole.hotel_admin && UserRole.super_admin)
  getRoomsByRoomId(@Param('room_id') room_id: string) {
    return this.roomService.getRoomsByRoomId(room_id);
  }

  // ----------FIND ALL ROOMS---------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.super_admin, UserRole.hotel_admin)
  @Get('get-rooms/:hotel_id')
  @ApiOperation({
    summary: 'Get Hotel Rooms',
    description: 'UserRole.admin',
  })
  getHotelRooms(@GetUser() user: User, @Param('hotel_id') hotel_id: string) {
    return this.roomService.findAllRooms(user, hotel_id);
  }

  //----------GET Total ROOMS BY ROOMTYPE------------
  @Get('/search/totalrooms')
  @ApiOperation({
    summary: 'Get total Rooms',
    description: `${RoomType.DELUXE}`,
  })
  findTotalRooms(@Query('room_type') room_type: RoomType) {
    return this.roomService.getTotalRoomsByType(room_type);
  }

  //---------- GET ROOM AVAILIABILITY--------------
  @Get('/check-status/:hotel_id')
  @ApiOperation({
    summary: 'Get Room Availiability',
    description: `${(RoomAvailiability.AVAILABLE, RoomAvailiability.OUT_OF_SERVICE)}`,
  })
  findRoomAvailiability(@Param('hotel_id') hotel_id: string) {
    console.log(hotel_id, 'controller');
    return this.roomService.findRoomAvailiability(hotel_id);
  }

  //----------GET ROOMS BY ROOMTYPE------------
  @Get('/types/:room_type/:hotel_id')
  @ApiOperation({
    summary: 'Get Rooms By types',
    description: `${RoomType.DELUXE}`,
  })
  findRoomByTypes(
    @Param('room_type') room_type: RoomType,
    @Param('hotel_id') hotel_id: string,
  ) {
    return this.roomService.getRoomByTypes(room_type, hotel_id);
  }

  // ------------DISPLAY HOTEL ROOMS IN LANDING--------------
  @Get('/getrooms/:hotel_id')
  @ApiOperation({
    summary: 'Get Hotel Rooms',
    description: `${UserRole.hotel_admin && UserRole.super_admin}`,
  })
  getRooms(@Param('hotel_id') hotel_id: string) {
    return this.roomService.getRoomsFromHotelId(hotel_id);
  }

  //------------ SEARCH ROOM BY NAME AND NUMBER ------------

  @Get('search/room')
  @ApiOperation({
    summary: 'Search Room',
    description: `${UserRole.hotel_admin}`,
  })
  SearchRoom(
    @Query('room_name') room_name: string,
    @Query('room_no') room_no: number,
  ) {
    return this.roomService.searchRoom(room_name, room_no);
  }

  // ------- DELETE ROOM BY ROOMID-----------
  @Delete(':room_id')
  @ApiOperation({
    summary: 'Delete Rooms by RoomId',
    description: `${UserRole.super_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT_auth')
  @Roles(UserRole.super_admin, UserRole.hotel_admin)
  deleteRoomsByRoomId(
    @GetUser('user_id') user_id: string,
    @Param('room_id') room_id: string,
  ) {
    return this.roomService.removeRoomByRoomId(user_id, room_id);
  }

  // ---------DELETE ROOM BY HOTELID-----------
  @Delete('/remove/:hotel_id')
  @ApiOperation({
    summary: 'Delete Room by HotelId',
    description: `${UserRole.super_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT_auth')
  @Roles(UserRole.super_admin)
  deleteRoomsByHotelId(
    @GetUser('user_id') user_id: string,
    @Param('hotel_id') hotel_id: string,
  ) {
    return this.roomService.removeRoomByHotelID(user_id, hotel_id);
  }
}
