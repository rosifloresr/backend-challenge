import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';

@Injectable()
export class LeadsService {
    constructor(
        @InjectRepository(Lead)
        private readonly leadRepository: Repository<Lead>
    ) {}

    async create(data: Partial<Lead>): Promise <Lead>{
        const existing = await this.leadRepository.findOne({
            where: {email: data.email},
        });

        if (existing) {
            throw new ConflictException('lead alredy exists');
        }

        const lead = this.leadRepository.create(data);
        return this.leadRepository.save(lead);
    }

    async findAll(): Promise<Lead[]> {
        return this.leadRepository.find();
    } 

    async findById(id: string): Promise<Lead> {
        const lead = await this.leadRepository.findOne({where: {id}});
        if (!lead) {
            throw new NotFoundException('Lead not found');
        }
        return lead;
    }
}
