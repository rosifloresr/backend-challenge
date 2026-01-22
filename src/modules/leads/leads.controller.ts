import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';
import { Public } from 'src/common/decorators/public.decorator';
import type { Queue } from 'bull';
import { InjectQueue } from '@nestjs/bull';

@UseGuards(ApiKeyGuard)
@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService,
        @InjectQueue('leads-ai')
        private readonly leadsAiQueue: Queue,
    ) {}


    @Public()
    @Post('create-lead')
    create(@Body() dto:CreateLeadDto){
        return this.leadsService.create({...dto, source:'manual',});
    }

    @Public()
    @Get('leads')
    findAll(){
        return this.leadsService.findAll();
    }

    @Public()
    @Get('lead/:id')
    findOne(@Param('id') id: string){
        return this.leadsService.findById(id);
    }

    @Public()
    @Post('lead/:id/summarize')
    async summarize(@Param('id') id: string) {
        const job = await this.leadsAiQueue.add('summarize', { leadId: id });
        const result = await job.finished();
        return result;
    }
}