import { HttpService } from '@nestjs/axios/dist';
import { Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { File } from '../entity/file.entity';
import { FileUrls } from 'src/entity/fileUrls.entity';




@Injectable()
export class FileService {

    private readonly logger = new Logger(FileService.name);

    baseUrl = process.env.DROPBOX_BASE_URL;


    constructor(private readonly httpService: HttpService,
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(FileUrls)
        private fileUrlsRepository: Repository<FileUrls>) { }

    findAllFile(): Promise<File[]> {
        return this.fileRepository.find();
    }

    findOneFile(id: number): Promise<File | undefined> {
        return this.fileRepository.findOneBy({ id })
    }

    createFile(file: File): Promise<File> {
        return this.fileRepository.save(file);
    }

    createFileUrl(fileUrl: FileUrls): Promise<FileUrls> {
        return this.fileUrlsRepository.save(fileUrl);
    }


    findFileUrl(uuid: string): Promise<FileUrls> {
        console.log(uuid);
        
        return this.fileUrlsRepository.findOneBy({ uuid });
    }

    async apiPost(url: string, file: any, headers) {
        headers = {
            ...headers, Authorization: `Bearer ${process.env.DROPBOX_TOKEN}`
        }

        const { data, headers: h } = await firstValueFrom(
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

        return { data, h };
    }


    async apiSaveFile(url: string, file: any, headers) {
        headers = {
            ...headers, Authorization: `Bearer ${process.env.DROPBOX_TOKEN}`
        }

        const { data, headers: h } = await firstValueFrom(
            this.httpService.post(url, file,
                {
                    baseURL: this.baseUrl,
                    headers,
                }).pipe(
                    catchError((error: any) => {
                        this.logger.error(error.response.data);
                        throw 'An error happened!';
                    }),
                ),
        );


        return { data, h };
    }

    getAllFile(): any {
        return 'All files'
    }
    test = []
    async saveFile(file: any) {
        const { data, h: headers } = await this.apiPost('/files/upload', file.buffer, { 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': `{ "path": "/uploads/${file.originalname}" }` });
        const fileDbData: File = {
            name: data.name,
            type: file.mimetype,
            path: data.path_lower,
            size: data.size,
            createdAt: data.server_modified,
            updatedAt: data.server_modified,
        }
        return this.createFile(fileDbData);
    }

    async getFileById(id: string) {
        const res = await this.apiSaveFile('/files/download', '', { 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': `{ "path": "/uploads/images (4).png" }` })
        return { data: res.data, headers: res.h };
    }


    async generateTmpUrl(fileId: number, duration: number) {
        const file = await this.findOneFile(fileId);
        if (!file) return [];

        const genratedUuid = uuidv4();
        const fileUrlCreateDate: FileUrls = {
            id: 0,
            uuid: genratedUuid,
            duration: duration,
            fileId: file.id,
            createdAt: new Date()
        }

        await this.createFileUrl(fileUrlCreateDate);

        return { tmpUrl: `http://localhost:3000/file/${genratedUuid}/tmp` }
        // return {tmpUrl: `${process.env.HOSTNAME}/${genratedUuid}`}
    }

    async getTmpFile(uuid: string) {
        const fileUrl = await this.findFileUrl(uuid)
        
        const urlTime = new Date(fileUrl.createdAt).getTime();
        const timeNow = new Date().getTime();

        const timeDiff = Math.round((timeNow - urlTime) / 60000)

        const isValidUrl = timeDiff <= fileUrl.duration;
        if(isValidUrl)
        return this.findOneFile(fileUrl.fileId);
        return {message: 'This is expired URL'};

    }

}

