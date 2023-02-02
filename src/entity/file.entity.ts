import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { FileUrls } from "./fileUrls.entity";


@Entity()
export class File {
    @PrimaryGeneratedColumn()
    id?: number;

    @Column()
    name: string;

    @Column()
    type: string;
    
    @Column()
    size: number;

    @Column()
    path: string;

    @Column({ type: 'timestamp' })
    createdAt: Date;

    @Column({ type: 'timestamp'})
    updatedAt: Date;

    @OneToMany(()=> FileUrls, (fileUrl) => fileUrl.fileId)
    fileUrls?: FileUrls[];
}
