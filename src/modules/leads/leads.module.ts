import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { HttpModule } from '@nestjs/axios';
import { LeadsSyncService } from './leads-sync.service';
import { BullModule } from '@nestjs/bull';
import {LeadsSyncProcessor} from './leads-sync.processor';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), HttpModule, BullModule.registerQueue({name: 'leads-sync',}),],
  providers: [LeadsService, LeadsSyncService, LeadsSyncProcessor],
  controllers: [LeadsController]
})
export class LeadsModule {}
