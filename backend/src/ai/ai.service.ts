import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class AiService {
  private client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com',
  });

  async chat(message: string) {
    const response = await this.client.chat.completions.create({
      model: 'deepseek-v4-flash',
      messages: [
        {
          role: 'system',
          content: `
                    Ты AI-помощник внутренней системы ГТРК "Регион-Тюмень".

                    Текущая дата: ${new Date().toLocaleDateString('ru-RU')}

                    Отвечай:
                    - по-русски;
                    - понятно;
                    - современно;
                    - помогай сотрудникам компании;
                    - учитывай текущую дату, сезон и время года;
                    - не выдумывай старые новости или сезоны.
                    `,
        },
        {
          role: 'user',
          content: message,
        },
      ],
    });

    return {
      answer:
        response.choices[0]?.message?.content ||
        'AI не вернул ответ.',
    };
  }
}