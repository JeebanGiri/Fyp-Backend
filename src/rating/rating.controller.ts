import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { RatingService } from './rating.service';
import { CreateRatingDto } from './dto/rating.dto';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { Roles } from 'src/@decorators/roles.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import { GetUser } from 'src/@decorators/getUser.decorator';

@Controller('rating')
export class RatingController {
  constructor(private readonly ratingService: RatingService) {}

  // -----------Make Rating--------------
  @Post('rate-hotel')
  @ApiOperation({
    summary: 'Rate a Hotels',
    description: 'UserRole.customer',
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.super_admin, UserRole.hotel_admin, UserRole.customer)
  @ApiBearerAuth('Jwt-auth')
  rateHotel(@GetUser() user: User, @Body() payload: CreateRatingDto) {
    return this.ratingService.rateHotels(user, payload);
  }

  @Get()
  findAll() {
    return this.ratingService.findAll();
  }
}
