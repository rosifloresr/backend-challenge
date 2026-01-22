import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { HttpModule } from '@nestjs/axios';
import { LeadsSyncService } from './leads-sync.service';
import { BullModule } from '@nestjs/bull';
import {LeadsSyncProcessor} from './leads-sync.processor';
import { AiModule } from 'src/infra/ai/ai.module';
import { AiService } from 'src/infra/ai/ai.service';
import { LeadsAiProcessor } from './leads-ai.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), HttpModule, AiModule, BullModule.registerQueue({name: 'leads-sync'},{name: 'leads-ai'},),],
  providers: [LeadsService, LeadsSyncService, LeadsSyncProcessor, AiService, LeadsAiProcessor],
  controllers: [LeadsController]
})
export class LeadsModule {}
