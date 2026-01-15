import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Lead } from './lead.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class LeadsSyncService {
  private readonly logger = new Logger(LeadsSyncService.name);

  constructor(
    @InjectRepository(Lead)
    private readonly leadRepository: Repository<Lead>,
    private readonly httpService: HttpService,
  ) {}

  //cada 5 minutos esta bien
  @Cron('0 */5 * * * *')
  async syncExternalLeads() {
    this.logger.log('Starting external lead sync');

    //importo 10 leads por ejecucion y evito duplicadooss
    const response = await firstValueFrom(
      this.httpService.get('https://randomuser.me/api/?results=10'),
    );

    const users = response.data.results;

    for (const user of users) {
      const email = user.email;

      const existing = await this.leadRepository.findOne({
        where: { email },
      });

      if (existing) {
        this.logger.warn(`Lead with email ${email} already exists`);
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

    this.logger.log('External lead sync finished');
  }
}
