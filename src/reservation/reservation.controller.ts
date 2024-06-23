import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Query,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReservationService } from './reservation.service';
import { JwtAuthGuard } from 'src/@Guards/auth.guard';
import { RolesGuard } from 'src/@Guards/roles.guard';
import { Roles } from 'src/@decorators/roles.decorator';
import { User, UserRole } from 'src/users/entities/user.entity';
import { GetUser } from 'src/@decorators/getUser.decorator';
import {
  CancelReservationDto,
  ChangeReservationStatus,
  CreateReservationDto,
  UpdateReservationDto,
} from './dto/reservation.dto';
import { PaymentGateway } from 'src/payment/entities/payment.entity';

@ApiTags('Reservation')
@Controller('reservation')
@ApiBearerAuth('JWT_auth')
export class ReservationController {
  constructor(private reservationService: ReservationService) {}

  //-------- CREATE HOTEL ROOM RESERVATION (CUSTOMER)-----------
  @Post(
    'reserve/:hotel_id/:room_id/:room_type/:room_quantity/:total_amount/:check_in_date/:check_out_date',
  )
  @ApiOperation({
    summary: 'Create Hotel Room Reservation',
    description: `${UserRole.customer}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer, UserRole.hotel_admin)
  reserveHotelRooms(
    @GetUser() user: User,
    @Param('hotel_id') hotel_id: string,
    @Param('room_id') room_id: string,
    @Param('room_type') room_Type: string,
    @Param('room_quantity') room_Quantity: number,
    @Param('total_amount') total_Amount: number,
    @Param('check_in_date') checkInDate: string,
    @Param('check_out_date') checkOutDate: string,
    @Body() payload: CreateReservationDto,
  ) {
    console.log(payload, 'payload from controller');

    return this.reservationService.makeHotelRoomsReservation(
      user,
      hotel_id,
      room_id,
      room_Type,
      room_Quantity,
      total_Amount,
      checkInDate,
      checkOutDate,
      payload,
    );
  }

  // --------APPROVE RESERVATION (HOTEL ADMIN)--------------
  @Post('approve-reservation/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  @ApiOperation({ summary: 'Approve the Reservation Status' })
  approveReservation(@GetUser() user: User, @Param('id') id: string) {
    return this.reservationService.approveRoomReservation(user, id);
  }

  // -------GET ALL RESERVATION (CUSTOMER)---------
  @Get('my-reservation')
  @ApiOperation({
    summary: 'Get All Reservation',
    description: `${UserRole.customer}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer)
  getMyReservation(
    @GetUser() user: User,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ) {
    return this.reservationService.getMyReservation(user, { page, limit });
  }

  //-----------GET CUSTOMER RESERVATION (CUSTOMER) ------------------
  @Get('get-reservation')
  @ApiOperation({
    summary: 'Get My Resrevation',
    description: `${UserRole.customer}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer, UserRole.hotel_admin)
  getReservation(@GetUser() user: User) {
    return this.reservationService.getReservation(user);
  }

  // --------GET ALL RESERVATION (Hotel Admin)-------------
  @Get('get-all-reservation')
  @ApiOperation({
    summary: 'Get All Reservation',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  getALLReservation(
    @GetUser() user: User,
    @Query('page') page: number,
    @Query('limit') limit: number,
  ) {
    return this.reservationService.getAllReservation(user, { page, limit });
  }

  // ---------- UPDATE A RESERVATION (HOTEL ADMIN)----------
  @Patch(':reservation_id')
  @ApiOperation({
    summary: 'Update A Reservation',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  updateReservation(
    @Param('reservation_id', ParseUUIDPipe) reservation_id: string,
    @Body() payload: UpdateReservationDto,
  ) {
    return this.reservationService.updateReservation(reservation_id, payload);
  }

  // ---------- UPDATE A RESERVATION (CUSTOMER)----------
  @Patch('my-reservation/:reservation_id')
  @ApiOperation({
    summary: 'Update A Reservation',
    description: `${UserRole.customer}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer)
  updateMyReservation(
    @Param('reservation_id', ParseUUIDPipe) reservation_id: string,
    @GetUser() user: User,
    @Body() payload: UpdateReservationDto,
  ) {
    return this.reservationService.updateMyReservation(
      reservation_id,
      user,
      payload,
    );
  }

  // ---------- DELETE RESERVATION (SELLER) ----------
  @Delete('remove/:reservation_id')
  @ApiOperation({
    summary: 'Delete reservations',
    description: `${UserRole.customer}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer)
  async deleteReservation(
    @GetUser('user_id') user_id: string,
    @Param('reservation_id', ParseUUIDPipe) reservation_id: string,
  ) {
    return this.reservationService.deleteReservation(reservation_id);
  }

  // ---------- CHANGE RESERVATOIN STATUS (HOTEL ADMIN) -------------
  @Post('change-status/:reservation_id')
  @ApiOperation({
    summary: 'Change RESERVATOIN Status',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  changeOrderStatus(
    @GetUser('id') user_id: string,
    @Body() payload: ChangeReservationStatus,
    @Param('reservation_id', ParseUUIDPipe) reservation_id: string,
  ) {
    return this.reservationService.changeReservationStatus(
      user_id,
      reservation_id,
      payload,
    );
  }

  // ---------- CANCEL THE RESERVATION ------------
  @Post('cancel/:reservation_id')
  @ApiOperation({
    summary: 'Cancel The RESERVATION',
    description: `${UserRole.customer}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.customer)
  cancelOrder(
    @Param('order_id', ParseUUIDPipe) reservation_id: string,
    @GetUser('id') user_id: string,
    @Body() input: CancelReservationDto,
  ) {
    return this.reservationService.cancelReservation(
      user_id,
      reservation_id,
      input,
    );
  }

  // --------Generate Report (Hotel Admin)-------------
  @Get('generate-report/:bookId/:user_id/:check_In_Date')
  @ApiOperation({
    summary: 'Generate',
    description: `${UserRole.hotel_admin}`,
  })
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.hotel_admin)
  generateReport(
    @Param('bookId') bookId: string,
    @Param('user_id') user_id: string,
    @Param('check_In_Date') check_In_Date: string,
  ) {
    return this.reservationService.generateCustomerReport(
      bookId,
      user_id,
      check_In_Date,
    );
  }
}
