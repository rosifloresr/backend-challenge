import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI;

  constructor(private readonly configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');

    if (!apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not configured',
      );
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  async summarizeLead(lead: {
    name: string;
    lastName: string;
    email: string;
    company?: string;
  }): Promise<{ summary: string; next_action: string }> {

    const model = this.genAI.getGenerativeModel({
      model: 'gemini-pro',
    });

    const prompt = `
    You are a CRM assistant.
    Return ONLY valid JSON with this exact format:
    {
      "summary": "string",
      "next_action": "string"
    }

    Lead data:
    Name: ${lead.name} ${lead.lastName}
    Email: ${lead.email}
    Company: ${lead.company ?? 'N/A'}
        `;

    const result = await model.generateContent(prompt);
    const text = result.response.text();

    return JSON.parse(text);
  }
}
