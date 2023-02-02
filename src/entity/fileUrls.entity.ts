import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { File } from "./file.entity";


@Entity()
export class FileUrls {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    uuid: string;

    @Column()
    fileId: number;
    
    // number of minutes
    @Column()
    duration: number;

    @Column({ type: 'timestamp' })
    createdAt: Date;

    @ManyToOne(()=> File, (file) => file.fileUrls)
    file?: File;
    
    
}
