import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { GetUser } from 'src/@decorators/getUser.decorator';
import { Roles } from 'src/@decorators/roles.decorator';
import { imageFileFilter, filename } from 'src/@helpers/storage';
import { User, UserRole } from 'src/users/entities/user.entity';

import {
  LoginHotelAdminDto,
  RegisterHotelAdminDto,
} from './dto/hoteladmin.dto';
import { HotelAdminService } from './hoteladmin.service';
import { CreateHotelDto, UpdateHotelDto } from 'src/hotel/dto/hotel.dto';

@Controller('hoteladmin')
export class HotelAdminController {
  constructor(private hotelAdminService: HotelAdminService) {}

  // ---------- REGISTER Hotel Admin ----------------

  @ApiOperation({
    summary: 'Register Hotel Admin.',
  })
  @Post('register-admin')
  register(@Body() payload: RegisterHotelAdminDto) {
    return this.hotelAdminService.register(payload);
  }

  // ---------- LOGIN Hotel Admin ----------
  @Post('login-admin')
  login(@Body() payload: LoginHotelAdminDto) {
    return this.hotelAdminService.login(payload);
  }

  // ---------- REGISTER HOTEL BY HOTEL ADMIN ----------
  @Post('register-hotel')
  @ApiOperation({
    summary: 'Register a Hotel',
    description: `${UserRole.hotel_admin}`,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
        { name: 'documents', maxCount: 3 },
        { name: 'citizenship_front', maxCount: 1 },
        { name: 'citizenship_back', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: 'static/hotel_admin/register-hotel',
          filename,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  @ApiConsumes('application/json')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.hotel_admin)
  registerHotel(
    @GetUser('id') user_id: string,
    @Body() payload: CreateHotelDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.hotelAdminService.registerHotel(user_id, payload, files);
  }

  // ---------GET HOTEL DETAILS (HOTEL ADMIN)----------------
  @Get()
  @ApiOperation({
    summary: 'Get Hotel',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  getMyHotel(@GetUser() user: User) {
    return this.hotelAdminService.getMyHotelDetails(user);
  }

  // -----GET TOTAL ROOMS----------------
  @Get('find/totalrooms')
  @ApiOperation({
    summary: 'Get Total Rooms',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  getAllRooms(@GetUser('user_id') user_id: string) {
    return this.hotelAdminService.getTotalRooms(user_id);
  }

  // -----GET TOTAL ROOMS----------------
  @Get('find/totalbooking')
  @ApiOperation({
    summary: 'Get Total Booking',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  gettotalReservation(@GetUser('user_id') user_id: string) {
    return this.hotelAdminService.getTotalBooking(user_id);
  }

  // -----GET TOTAL INCOME----------------
  @Get('find/totalrating')
  @ApiOperation({
    summary: 'Get Rating',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  getTotalRating(@GetUser('user_id') user_id: string) {
    return this.hotelAdminService.findTotalRating(user_id);
  }

  // ------GET TOTAL INCOME------------
  @Get('find/total-income')
  @ApiOperation({
    summary: 'Get Total Income',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  getTotalIncome(@GetUser('user_id') user_id: string) {
    return this.hotelAdminService.findTotalIncome(user_id);
  }

  // ------GET TOTAL Customer------------
  @ApiOperation({
    summary: 'Get Customer',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  @Get('find/customer')
  getCustomer(@GetUser('user_id') user_id: string) {
    return this.hotelAdminService.findTotalCustomer(user_id);
  }

  //-------------UPDATE HOTEL ADMIN DETAILS--------------

  @Patch('edit-hotel/:hotel_id')
  @ApiOperation({
    summary: 'Register a Hotel',
    description: `${UserRole.hotel_admin}`,
  })
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'avatar', maxCount: 1 },
        { name: 'cover', maxCount: 1 },
        { name: 'documents', maxCount: 3 },
        { name: 'profile_photo', maxCount: 1 },
        { name: 'citizenship_front', maxCount: 1 },
        { name: 'citizenship_back', maxCount: 1 },
      ],
      {
        storage: diskStorage({
          destination: 'static/hotel_admin/register-hotel',
          filename,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  @ApiConsumes('application/json')
  @ApiConsumes('multipart/form-data')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.hotel_admin)
  editHotelDetails(
    @GetUser('id') user_id: string,
    @Param('hotel_id', new ParseUUIDPipe()) hotel_id: string,
    @Body() payload: UpdateHotelDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.hotelAdminService.editHotelDetails(
      user_id,
      hotel_id,
      payload,
      files,
    );
  }
}
