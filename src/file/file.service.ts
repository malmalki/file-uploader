import { HttpService } from '@nestjs/axios/dist';
import { Injectable, Logger } from '@nestjs/common';

// Step 1: Import the S3Client object and all necessary SDK command
import { catchError, firstValueFrom } from 'rxjs';



@Injectable()
export class FileService {

    private readonly logger = new Logger(FileService.name);

    constructor(private readonly httpService: HttpService) {

    }

    async apiPost(url: string, file: any, headers) {
        headers = {
            ...headers, Authorization: `Bearer ${process.env.DROPBOX_TOKEN}`
        }

        const { data , headers: h} = await firstValueFrom(
            this.httpService.post(url, file,
                {
                    baseURL: 'https://content.dropboxapi.com/2',
                    headers,
                }).pipe(
              catchError((error: any) => {                
                this.logger.error(error.response.data);
                throw 'An error happened!';
              }),
            ),
          );
          
          return { data, h};
    }

    async apiSaveFile(url: string, file: any, headers) {
        headers = {
            ...headers, Authorization: `Bearer ${process.env.DROPBOX_TOKEN}`
        }

        const { data , headers: h} = await firstValueFrom(
            this.httpService.post(url, file,
                {
                    baseURL: 'https://content.dropboxapi.com/2',
                    headers,
                }).pipe(
              catchError((error: any) => {                
                this.logger.error(error.response.data);
                throw 'An error happened!';
              }),
            ),
          );
          
          
          return { data, h};
    }

    getAllFile(): any {
        return 'All files'
    }
test = []
    async saveFile(file: any) {
        
        return this.apiPost('/files/upload', file.buffer, { 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': `{ "path": "/uploads/${file.originalname}" }` })
        // return this.tmpArr.length - 1;
    } 

    async getFileById(id: string) {
        const res = await this.apiSaveFile('/files/download', '', { 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': `{ "path": "/uploads/images (4).png" }` })        
        return {data: res.data, headers: res.h};
    }

}

