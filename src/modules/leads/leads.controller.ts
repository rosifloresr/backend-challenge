import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { LeadsService } from './leads.service';
import { CreateLeadDto } from './dto/create-lead.dto';
import { ApiKeyGuard } from 'src/common/guards/api-key.guard';

@UseGuards(ApiKeyGuard)
@Controller('leads')
export class LeadsController {
    constructor(private readonly leadsService: LeadsService) {}

    @Post('create-lead')
    create(@Body() dto:CreateLeadDto){
        return this.leadsService.create({...dto, source:'manual',});
    }

    @Get('leads')
    findAll(){
        return this.leadsService.findAll();
    }

    @Get('leads/id')
    findOne(@Param('id') id: string){
        return this.leadsService.findById(id);
    }
}