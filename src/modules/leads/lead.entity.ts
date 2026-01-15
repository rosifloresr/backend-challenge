import { Entity, PrimaryGeneratedColumn,Column,CreateDateColumn,UpdateDateColumn,Index } from "typeorm";

@Entity('leads')
export class Lead {
    @PrimaryGeneratedColumn('uuid')
    id:string;

    @Column()
    name: string;

    @Column()
    lastName: string;

    @Index({unique: true})
    @Column()
    email:string;

    @Column({nullable:true})
    phone?: string;

    @Column({nullable: true})
    company?:string;

    @Column({nullable:true})
    source: string; //puede ser manual o de randomuser

    @Column({nullable:true})
    externalId?: string;

    @Column({type: 'text', nullable: true})
    summary?: string;

    @Column({type: 'text', nullable:true})
    nextAction?: string;

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updateAt: Date;
}