import { Injectable } from '@nestjs/common';

@Injectable()
export class FileService {
    getAllFile(): any{
        return 'All files'
    }
}
