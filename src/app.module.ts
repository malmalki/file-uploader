import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { FileController } from './file/file.controller';
import { FileService } from './file/file.service';

@Module({
  imports: [HttpModule,ConfigModule.forRoot()],
  controllers: [AppController, FileController],
  providers: [AppService, FileService],
})
export class AppModule {}
 