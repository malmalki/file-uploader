import { HttpModule } from '@nestjs/axios';
import { CacheModule, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './file/file.controller';
import { File } from './entity/file.entity';
import { FileService } from './file/file.service';
import { FileUrls } from './entity/fileUrls.entity';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-store';



@Module({
  imports: [
    ConfigModule.forRoot(),
    CacheModule.register<RedisClientOptions>({
      isGlobal: true,
      // @ts-ignore
      store: async () => await redisStore({
        socket: {
          host: process.env.REDIS_HOST,
          port: 6379,
        }
      }),
    }),
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST,
      port: parseInt(process.env.DB_PORT),
      username: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      entities: [File, FileUrls],
      synchronize: true,
      dropSchema: false
    }),
    TypeOrmModule.forFeature([File, FileUrls]),
    HttpModule,
  ],
  controllers: [AppController, FileController],
  providers: [AppService, FileService],
})
export class AppModule { }
