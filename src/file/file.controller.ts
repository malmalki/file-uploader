import { Controller, FileTypeValidator, Get, ParseFilePipe, Post, Res, UploadedFile, UseInterceptors, Param, Body, CacheInterceptor, CacheTTL } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { FileService } from './file.service';

@Controller('file')
export class FileController {

    constructor(private readonly fileService: FileService) { }

    @Post()
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@UploadedFile(
        new ParseFilePipe({
            validators: [
                // TODO: this validation only check file extensions, it's need proper validation that check the file it self 
                new FileTypeValidator({ fileType: '.(png|jpg|pdf)' }),
            ],
        })
    ) file: Express.Multer.File) {
        return await this.fileService.saveFile(file)
    }

    @Get()
    async getAllFile(@Res() res: Response) {
        res.send(await this.fileService.findAllFile())
    }

    @Get(':id')
    async getFile(@Param('id') param, @Res() res: Response) {
        res.send(await this.fileService.findOneFile(param))
    }

    @Post(':id/generate')
    async getTmpUrl(
        @Param('id') param,
        @Body() body: { duration: number },
        @Res() res: Response) {
        res.contentType('application/json')
        res.send(await this.fileService.generateTmpUrl(param, body.duration))
    }


    @Get(':uuid/tmp')
    async getFileBinary(@Param('uuid') param,
        @Res() res: Response) {
        const file = await this.fileService.getTmpFile(param);
        res.contentType('application/octet-stream');
        if (file.message)
            res.contentType('application/json');
        res.send(file);

    }
}
