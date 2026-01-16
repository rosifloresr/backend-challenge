import {ConflictException, Injectable, NotFoundException, Inject,} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import { AiService } from 'src/infra/ai/ai.service';

@Injectable()
export class LeadsService {
  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,

    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,

    private readonly aiService: AiService,
  ) {}

  async create(data: Partial<Lead>): Promise<Lead> {
    const existing = await this.leadRepository.findOne({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictException('Lead already exists');
    }

    const lead = this.leadRepository.create(data);
    return this.leadRepository.save(lead);
  }

  async findAll(): Promise<Lead[]> {
    return this.leadRepository.find();
  }

  async findById(id: string): Promise<Lead> {
    const cacheKey = `lead:${id}`;

    const cachedLead = await this.cacheManager.get<Lead>(cacheKey);
    if (cachedLead) {
      return cachedLead;
    }

    const lead = await this.leadRepository.findOne({
      where: { id },
    });

    if (!lead) {
      throw new NotFoundException('Lead not found');
    }

    await this.cacheManager.set(cacheKey, lead, 60);

    return lead;
  }

  async summarizeLead(id: string): Promise<{summary: string; next_action: string;}>{
    const lead = await this.leadRepository.findOne({where: {id},});

    if (!lead){
        throw new NotFoundException('lead not found');
    }

    const result = await this.aiService.summarizeLead(lead);
    lead.summary = result.summary;
    lead.nextAction = result.next_action;

    await this.leadRepository.save(lead);
    await this.cacheManager.del(`lead:${id}`); //lo invalido
    return result;
  }
}
