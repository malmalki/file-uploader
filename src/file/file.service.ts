import { HttpService } from '@nestjs/axios/dist';
import { CACHE_MANAGER, Inject, Injectable, Logger } from '@nestjs/common';
import { catchError, firstValueFrom } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';

import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { File } from '../entity/file.entity';
import { FileUrls } from 'src/entity/fileUrls.entity';
import { Cache } from 'cache-manager';




@Injectable()
export class FileService {
    private readonly logger = new Logger(FileService.name);

    baseUrl = process.env.DROPBOX_BASE_URL;

    constructor(private readonly httpService: HttpService,
        @InjectRepository(File)
        private fileRepository: Repository<File>,
        @InjectRepository(FileUrls)
        private fileUrlsRepository: Repository<FileUrls>,
        @Inject(CACHE_MANAGER) private cacheService: Cache,
    ) { }

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
        return this.fileUrlsRepository
            .createQueryBuilder('url')
            .select(['url.id', 'url.uuid', 'url.duration', 'url.createdAt'])
            .leftJoinAndSelect('url.file', 'file', 'url.fileId = file.id')
            .addSelect(['file.type'])
            .where('url.uuid = :uuid', { uuid })
            .getOne();
    }

    async apiPost(url: string, file: any, headers) {
        headers = {
            ...headers, Authorization: `Bearer ${process.env.DROPBOX_TOKEN}`
        }

        const { data } = await firstValueFrom(
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
        return data;
    }

    async saveFile(file: any) {
        const data = await this.apiPost('/files/upload', file.buffer, { 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': `{ "path": "/uploads/${file.originalname}" }` });
        const fileDbData: File = {
            name: data.name,
            type: file.mimetype,
            path: data.path_lower,
            size: data.size,
            createdAt: data.server_modified,
            updatedAt: data.server_modified,
        }
        //TODO: need validation to prevent adding the same file
        return this.createFile(fileDbData);
    }

    async getFileByPath(path: string) {
        return this.apiPost('/files/download', '', { 'Content-Type': 'application/octet-stream', 'Dropbox-API-Arg': `{ "path": "${path}" }` })
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

        // TODO: this will not work in producation, maybe use env here
        return { tmpUrl: `http://localhost:3000/file/${genratedUuid}/tmp` }
    }

    //TODO: refactor leater, i don't like it
    async getTmpFile(uuid: string) {
        const fileUrl = await this.findFileUrl(uuid);
        if (!fileUrl) return { message: 'This is expired URL' };
        const urlTime = new Date(fileUrl.createdAt).getTime();
        const timeNow = new Date().getTime();

        const timeDiff = Math.round((timeNow - urlTime) / 60000)
        const isValidUrl = timeDiff <= fileUrl.duration;

        if (isValidUrl && fileUrl.file.type.includes('image')) {
            const chachedFile = await this.cacheService.get(uuid);
            if (chachedFile) {
                return chachedFile;
            }
        }
        const fileBinery = await this.getFileByPath(fileUrl.file.path);
        if (fileUrl.file.type.includes('image'))
            await this.cacheService.set(uuid, fileBinery);
        if (isValidUrl)
            return fileBinery;
        return { message: 'This is expired URL' };

    }
}
