import {
  Body,
  Controller,
  Get,
  Patch,
  Query,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { GetUser } from 'src/@decorators/getUser.decorator';
import { User, UserRole } from './entities/user.entity';
import { Roles } from 'src/@decorators/roles.decorator';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { diskStorage } from 'multer';
import {
  ChangePasswordDto,
  GetUsersQuery,
  UpdateProfilePhotoDto,
  UpdateUserDto,
} from './dto/user.dto';
import { filename, imageFileFilter } from 'src/@helpers/storage';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService) {}

  //------------GET CURRENT USER------------
  @Get('current-user')
  @UseGuards(JwtAuthGuard)
  async getCurrentUser(@GetUser() user: User) {
    user.avatar = user.avatar ? user.avatar : null;
    return user;
  }

  // ---------- GET ALL USERS (ADMIN) ----------

  @Get('get-users')
  @ApiOperation({
    summary: 'Get all users.',
    description: `${(UserRole.super_admin, UserRole.hotel_admin)}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin)
  getAllUsers(@Query() query: GetUsersQuery, @GetUser() user: User) {
    return this.userService.getAllUsers(user.role, query);
  }

  // ---------- UPDATE CURRENT USER ----------

  @UseGuards(JwtAuthGuard)
  @Patch('current-user')
  @ApiOperation({
    summary: 'Update current user ',
    description: 'UserRole.All',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: 'static/user/avatars',
        filename,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  updateCurrentUser(
    @GetUser() user: User,
    @Body() payload: UpdateUserDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateCurrentUser(user, payload, file);
  }

  // -----------CHANGE PROFILE-----------
  @UseGuards(JwtAuthGuard)
  @Patch('update-profile')
  @ApiOperation({
    summary: 'Update user profile',
    description: 'UserRole.All',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: 'static/user/avatars',
        filename,
      }),
      fileFilter: imageFileFilter,
    }),
  )
  updateProfile(
    @GetUser() user: User,
    payload: UpdateProfilePhotoDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    return this.userService.updateUserProfile(user, payload, file);
  }

  //------- CHANGE PASSWORD-------------
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer, UserRole.super_admin, UserRole.hotel_admin)
  @Patch('change-password')
  @ApiOperation({ summary: 'Change Password' })
  passwordChange(@GetUser() user: User, @Body() payload: ChangePasswordDto) {
    return this.userService.changePassword(user, payload);
  }
}
