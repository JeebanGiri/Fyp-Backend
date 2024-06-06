import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';

import { randomUUID } from 'crypto';
import * as Path from 'path';
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
import {
  CreateHotelDto,
  SetLocationDto,
  UpdateHotelDto,
} from './dto/hotel.dto';
import { HotelService } from './hotel.service';

const storage = {
  storage: diskStorage({
    destination: 'static/hotel',
    filename: (req, file, cb) => {
      const filename: string = 'myfile-' + randomUUID();
      const extension: string = Path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
};

@ApiTags('Hotel')
@Controller('hotel')
export class HotelController {
  constructor(private hotelService: HotelService) {}
  // ---------------REGISTER HOTEL---------------
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
        { name: 'documents', maxCount: 5 },
        { name: 'citizenship_front', maxCount: 1 },
        { name: 'citizenship_back', maxCount: 1 },
      ],
      storage,
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
    return this.hotelService.registerHotel(user_id, payload, files);
  }

  // -------SET HOTEL LOCATION------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @ApiBearerAuth('JWT-auth')
  @Roles(UserRole.hotel_admin, UserRole.super_admin)
  @Post('/set-location/:hotelId')
  @ApiOperation({
    summary: 'Set Hotel Location',
    description: `${(UserRole.super_admin, UserRole.hotel_admin)}`,
  })
  setLocation(
    @GetUser() user: User,
    @Param('hotel_id') hotel_id: string,
    @Body() payload: SetLocationDto,
  ) {
    return this.hotelService.addLocation(user, hotel_id, payload);
  }

  // ----------GET HOTEL LOCATION--------------
  @Get('/get-location/:hotel_id')
  @ApiOperation({
    summary: 'Get hotel Location',
    description: 'UserRole.super_admin, userRole.customer',
  })
  getLocation(@Param('hotel_id') hotel_id: string) {
    return this.hotelService.getHotelLocation(hotel_id);
  }

  // ----------UPDATE HOTEL -------------------
  @Patch(':hotel_id')
  @ApiOperation({
    summary: 'Edit a Hotel',
    description: `${UserRole.super_admin}`,
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
          destination: 'static/hotel',
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
  @Roles(UserRole.super_admin)
  updateHotel(
    @GetUser() user: User,
    @Param('hotel_id', ParseUUIDPipe) hotel_id: string,
    @Body() payload: UpdateHotelDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.hotelService.updateHotel(user, hotel_id, payload, files);
  }

  // ----------GET HOTEL BY ID---------------
  @Get('find/:hotel_id')
  @ApiOperation({
    summary: 'Get Hotel By Id',
    description: 'UserRole.customer, UserRole.admin',
  })
  getHotelById(@Param('hotel_id') hotel_id: string) {
    return this.hotelService.findHotel(hotel_id);
  }

  // ---------- SEARCH HOTEL BY NAME ----------
  @Get('search/name')
  @ApiOperation({
    summary: 'Search Hotel By Name',
    description: 'UserRole.customer, UserRole.admin, UserRole.super_admin',
  })
  getHotelByNameWithRooms(@Query('hotel_name') hotel_name: string) {
    console.log(hotel_name);
    return this.hotelService.getHotelByNameWithRooms(hotel_name);
  }

  // ---------- SEARCH HOTEL BY Address checkin and checkout ----------
  @Get('search/location/check-in/check-out')
  @ApiOperation({
    summary: 'Search Hotel By location',
    description: 'UserRole.customer, UserRole.admin, UserRole.super_admin',
  })
  filterHotel(
    @Query('address') address: string,
    @Query('check-in') check_in: string,
    @Query('check-out') chec_out: string,
  ) {
    return this.hotelService.filteredHotels(address, check_in, chec_out);
  }

  // ---------- SEARCH HOTEL BY NAME ----------
  @Get('search')
  @ApiOperation({
    summary: 'Search Hotel By Name',
    description: 'UserRole.customer, UserRole.admin, UserRole.super_admin',
  })
  getHotelByName(@Query('hotel_name') hotel_name: string) {
    console.log(hotel_name);
    return this.hotelService.getHotelByName(hotel_name);
  }

  // ---------SEARCH HOTEL BY ADDRESS-------------
  @Get('search/address')
  @ApiOperation({
    summary: 'Search Hotel By address',
    description: 'UserRole.customer, UserRole.admin, UserRole.super_admin',
  })
  getHotelByLocation(
    @Query('address') address: string,
    @Query('minPrice') minPrice?: number,
    @Query('maxPrice') maxPrice?: number,
  ) {    
    return this.hotelService.getHotelByLocation(address, minPrice, maxPrice);
  }

  // -----------GET HOTEL BY HOTEL ADMIN------------
  @Get('my-hotel')
  @ApiOperation({
    summary: 'Get Hotel Admin Hotel',
    description: 'UserRole.hotel_admin',
  })
  @ApiBearerAuth('JWT_auth')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  getMyHotel(@GetUser('user_id') user_id: string) {
    return this.hotelService.getMyHotel(user_id);
  }

  // -----------DELETE HOTEL BY ID--------------
  @Delete(':hotel_id')
  @ApiOperation({
    summary: 'Delete a Hotels',
    description: 'UserRole.hotel_admin',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin, UserRole.hotel_admin)
  @ApiBearerAuth('Jwt-auth')
  DeleteHotel(
    @GetUser('user_id') user_id: string,
    @Param('hotel_id', ParseUUIDPipe) hotel_id: string,
  ) {
    return this.hotelService.deletehotelById(user_id, hotel_id);
  }

}
