import { Controller, FileTypeValidator, Get, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { createReadStream, readFileSync, writeFile } from 'fs';
import { join } from 'path';
import { FileService } from './file.service';

@Controller('file')
export class FileController {

    constructor(private readonly fileService: FileService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                new FileTypeValidator({ fileType: '.(png|jpg|pdf)' }),
            ],
        })
    ) file: Express.Multer.File) {
        return await this.fileService.saveFile(file)
    }

    @Get()
    async getAllFile(@Res() res: Response) {
        const a = await this.fileService.getFileById('')
        const image = Buffer.from(a.data, 'binary')

        console.log(image);

        //   res.contentType('image/png')
        //   res.attachment('aaaa.png')
        //   res.send(image)
        res.send({
            image,
            extension: 'base64',
        });
    }

    @Get('package')
    getFile(@Res() res: Response) {
        const file = createReadStream(join(process.cwd(), 'ts.png'));
        file.pipe(res);
    }
}
