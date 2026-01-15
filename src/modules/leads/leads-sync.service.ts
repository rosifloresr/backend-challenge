import { InjectQueue } from '@nestjs/bull';
import { Injectable } from '@nestjs/common';
import type { Queue } from 'bull';
import { Cron } from '@nestjs/schedule';
import { Logger } from '@nestjs/common';

@Injectable()
export class LeadsSyncService {
  private readonly logger = new Logger(LeadsSyncService.name);

  constructor(
    @InjectQueue('leads-sync')
    private readonly leadsQueue: Queue,
  ) {}

  //cada 5 min
  @Cron('0 */5 * * * *')
  async enqueueSync() {
    this.logger.log('Enqueuing lead sync job');

    await this.leadsQueue.add(
      'sync',
      {},
      {
        attempts: 3,
        backoff: 5000,
      },
    );
  }
}
