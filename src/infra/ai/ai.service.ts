import { Injectable } from "@nestjs/common";
import OpenAI from "openai";

@Injectable()
export class AiService {
    private readonly client: OpenAI;
    
    constructor() {
        this.client = new OpenAI({apiKey: process.env.OPENAI_API_KEY,});
    }
    async summarizeLead(lead: {
        name: string; lastName: string; email: string; company?: string; }): Promise<{summary: string; next_action:string}> {
            const prompt = `You are a CRM assistant. Given the following lead information, generate:
            1) a short professional summary
            2) a suggested next action
            Return ONLY a valid JSON object with this exact structure:
            {
                "summary": "string",
                "next_action": "string"
            }
            Lead data:
            Name: ${lead.name} ${lead.lastName}
            Email: ${lead.email}
            Company: ${lead.company ?? 'N/A'}`;

            const response = await this.client.chat.completions.create({
                model: 'gpt-4.1-mini',
                messages: [{role: 'user', content: prompt}],
                temperature: 0.2,
            });

            const content = response.choices[0].message.content;
            return JSON.parse(content as string);
    }
}