import { Processor, Process } from '@nestjs/bull';
import type { Job } from 'bull';
import { Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Processor('leads-sync')
export class LeadsSyncProcessor {
  private readonly logger = new Logger(LeadsSyncProcessor.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    private readonly httpService: HttpService,
  ) {}

  @Process('sync')
  async handleSync(job: Job) {
    this.logger.log(`Processing sync job ${job.id}`);

    const response = await firstValueFrom(
      this.httpService.get('https://randomuser.me/api/?results=10'),
    );

    const users = response.data.results;

    for (const user of users) {
      const email = user.email;

      const exists = await this.leadRepository.findOne({
        where: { email },
      });

      if (exists) {
        continue;
      }

      const lead = this.leadRepository.create({
        name: user.name.first,
        lastName: user.name.last,
        email,
        phone: user.phone,
        source: 'randomuser',
        externalId: user.login.uuid,
      });

      await this.leadRepository.save(lead);
    }

    this.logger.log(`Sync job ${job.id} completed`);
  }
}
