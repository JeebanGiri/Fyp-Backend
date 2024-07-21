// import { UseFilters, UsePipes, ValidationPipe } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import {
//   OnGatewayConnection,
//   OnGatewayDisconnect,
//   OnGatewayInit,
//   SubscribeMessage,
//   WebSocketGateway,
//   WebSocketServer,
// } from '@nestjs/websockets';
// import {Server} from "socket.io"
// import { Hotel } from 'src/hotel/entities/hotel.entity';
// import { Rooms } from 'src/rooms/entities/rooms.entity';
// import { User } from 'src/users/entities/user.entity';
// import { Repository } from 'typeorm';
// import { SocketService } from '../socket.service';
// import { ReservationService } from 'src/reservation/reservation.service';

// @UseFilters(WebsocketExceptionsFilter)
// @UsePipes(new ValidationPipe({ transform: true }))
// @WebSocketGateway({
//   cors: {
//     origin: '*',
//   },
// })
// export class SocketGateway
//   implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
// {
//   constructor(
//     @InjectRepository(User) private readonly userRepository: Repository<User>,
//     @InjectRepository(Hotel) private readonly hotelRepository: Repository<Hotel>,
//     @InjectRepository(Rooms) private readonly roomsRepository: Repository<Rooms>,
//     private socketService: SocketService,
//     private reservationService: ReservationService
//   ) {}

//   @WebSocketServer()
//   public server: Server;

//   afterInit(server: Server) {
//     this.socketService.all_sockets = server;
//   }
//   async handleConnection(socket: Socket) {
    
//   }

//   @SubscribeMessage('message')
//   handleMessage(client: any, payload: any): string {
//     return 'Hello world!';
//   }
// }

export class SocketGateway{
  
}