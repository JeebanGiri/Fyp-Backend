import { Module } from '@nestjs/common';
import { SocketGateway } from './Gateway/socket.gateway';

@Module({
  providers: [SocketGateway]
})
export class SocketModule {}
