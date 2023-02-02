import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './file/file.controller';
import { File } from './entity/file.entity';
import { FileService } from './file/file.service';
import { FileUrls } from './entity/fileUrls.entity';


@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: 'localhost',
      port: 3306,
      username: 'dbuser',
      password: 'password',
      database: 'file-uploader',
      entities: [File, FileUrls],
      synchronize: true,
      dropSchema: false
    }),
    TypeOrmModule.forFeature([File, FileUrls]),
    HttpModule,
    ConfigModule.forRoot()],
  controllers: [AppController, FileController],
  providers: [AppService, FileService],
})
export class AppModule { }
