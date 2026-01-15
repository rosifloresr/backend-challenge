import { Module } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { LeadsController } from './leads.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Lead } from './lead.entity';
import { HttpModule } from '@nestjs/axios';
import { LeadsSyncService } from './leads-sync.service';

@Module({
  imports: [TypeOrmModule.forFeature([Lead]), HttpModule],
  providers: [LeadsService, LeadsSyncService],
  controllers: [LeadsController]
})
export class LeadsModule {}
