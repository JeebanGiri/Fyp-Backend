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
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { Roles } from 'src/@decorators/roles.decorator';
import { imageFileFilter, filename } from 'src/@helpers/storage';
import { UserRole } from 'src/users/entities/user.entity';
import { SuperadminService } from './superadmin.service';
import {
  AddHotelAdminDetailDto,
  EditHotelAdminDetailDto,
  RegisterAdminDto,
} from './dto/super-admin.dto';
import { GetUser } from 'src/@decorators/getUser.decorator';

@ApiTags('Super Admin')
@ApiBearerAuth()
@Controller('superadmin')
export class SuperadminController {
  constructor(private superAdminService: SuperadminService) {}

  // ---------- REGISTER  HOTEL ADMIN ----------------
  @Post('register-hoteladmin')
  @ApiOperation({
    summary: 'Register Admin.',
    description: `${UserRole.super_admin}`,
  })
  @Roles(UserRole.super_admin)
  @UseGuards(JwtAuthGuard, RolesGuard)
  registerAdmin(@Body() payload: RegisterAdminDto) {
    return this.superAdminService.registerHotelAdmin(payload);
  }

  // ---------- REGISTER HOTEL ADMIN DETAILS BY SUPER ADMIN  ----------------
  @Post('register-hotel')
  @ApiOperation({
    summary: 'Register hotel admin details.',
    description: `${UserRole.super_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  @ApiBearerAuth('JWT-Auth')
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
  addHotelAdminDetail(
    @Body() payload: AddHotelAdminDetailDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.superAdminService.addHotelAdminDetails(payload, files);
  }

  // ---------EDIT HOTEL ADMIN DETAILS------------

  @Patch('edit-hoteladmin-details/:user_id')
  @ApiOperation({
    summary: 'Edit hotel admin details.',
    description: `${UserRole.super_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
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
          destination: 'static/hotel-admin/hotel-admin-register',
          filename,
        }),
        fileFilter: imageFileFilter,
      },
    ),
  )
  editHotelAdminDetail(
    @Param('user_id', ParseUUIDPipe) user_id: string,
    @Body() payload: EditHotelAdminDetailDto,
    @UploadedFiles() files: Express.Multer.File[],
  ) {
    return this.superAdminService.UpdateHotelAdminDetails(
      user_id,
      payload,
      files,
    );
  }

  // ---------APPROVE HOTEL DETAILS ------------

  @Post('approve-hotel/:id')
  @ApiOperation({
    summary: 'Register a Hotel',
    description: `${UserRole.super_admin}`,
  })
  // @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  @ApiBearerAuth('JWT-auth')
  approveHotelDetails(@Param('id') id: string) {
    return this.superAdminService.approveHotelAdminDetails(id);
  }

  // ---------- DELETE HOTEL ADMIN AND HOTEL DETAILS ----------

  @Delete(':user_id')
  @ApiOperation({ summary: 'Delete Hotel', description: 'Roles : Super_admin' })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  async deleteHotelAdminWithHotelDetails(
    @Param('user_id', ParseUUIDPipe) user_id: string,
  ) {
    return this.superAdminService.removeHotelandHotelAdminDetails(user_id);
  }

  // ------------GET HOTEL COUNT (SUPER ADMIN)----------------
  @Get('hotel/total')
  @ApiOperation({
    summary: 'Get Total Hotel',
    description: `${UserRole.super_admin}`,
  })
  @Roles(UserRole.super_admin)
  getHotelTotal() {
    return this.superAdminService.getTotalHotel();
  }

  //-----------GET RESERVATION COUNT (SEUPER ADMIN)--------------
  @Get('reservation/total')
  @ApiOperation({
    summary: 'Get Total Reservation',
    description: `${UserRole.super_admin}`,
  })
  @Roles(UserRole.super_admin)
  getTotalReservation() {
    return this.superAdminService.getTotalReservation();
  }

  //-----------GET RESERVATION COUNT (SEUPER ADMIN)--------------
  @Get('rooms/total')
  @ApiOperation({
    summary: 'Get Total Reservation',
    description: `${UserRole.super_admin}`,
  })
  @Roles(UserRole.super_admin)
  getTotalRoom() {
    return this.superAdminService.getTotalRoom();
  }

  //---------- GET ALL HOTELS------------------
  @Get('hotels/all')
  @ApiOperation({
    summary: 'Find All Hotels',
    description: 'UserRole.super_admin',
  })
  getAllHotels(@Query('page') page: number, @Query('limit') limit: number) {
    return this.superAdminService.findAllHotels({ page, limit });
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
    return this.superAdminService.deletehotelById(user_id, hotel_id);
  }
}
