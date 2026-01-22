import { Process, Processor } from '@nestjs/bull';
import type { Job } from 'bull';
import { LeadsService } from './leads.service';
import { AiService } from '../../infra/ai/ai.service';

@Processor('leads-ai')
export class LeadsAiProcessor {
  constructor(
    private readonly leadsService: LeadsService,
    private readonly aiService: AiService,
  ) {}

  @Process('summarize')
  async handleSummarize(job: Job<{ leadId: string }>) {
    const { leadId } = job.data;
    const lead = await this.leadsService.findById(leadId);

    const aiResult = await this.aiService.summarizeLead(lead);
    const updatedLead = await this.leadsService.updateSummary(
      leadId,
      aiResult.summary,
      aiResult.next_action,
    );

    return {
      summary: updatedLead.summary,
      next_action: updatedLead.nextAction,
    };
  }
}
