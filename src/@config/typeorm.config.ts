import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { DATABASE } from './constants.config';

export const TypeormConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: DATABASE.host,
  port: DATABASE.port,
  username: DATABASE.user,
  password: DATABASE.password,
  database: DATABASE.database,
  entities: [__dirname + '/../**/*.entity{.ts,.js}'],
  synchronize: true,
  autoLoadEntities: true,
  logging: false,
};
