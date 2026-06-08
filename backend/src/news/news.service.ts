import { Injectable } from '@nestjs/common';
import axios from 'axios';
import * as cheerio from 'cheerio';
import * as https from 'https';

@Injectable()
export class NewsService {
  async findLatest() {
    try {
      const { data } = await axios.get('https://region-tyumen.ru/articles/', {
        httpsAgent: new https.Agent({
          rejectUnauthorized: false,
        }),
      });

      const $ = cheerio.load(data);
      const news: any[] = [];

      $('a').each((_, element) => {

        let imageUrl =
        $(element).find('img').first().attr('src') ||
        $(element).parent().find('img').first().attr('src') ||
        $(element).closest('div').find('img').first().attr('src') ||
        '';

        if (imageUrl && !imageUrl.startsWith('http')) {
        imageUrl = `https://region-tyumen.ru${imageUrl}`;
        }
        if (news.length >= 10) return false;

        const title = $(element).text().trim();
        let url = $(element).attr('href') || '';

        const isNewsLink =
          url.includes('/articles/') &&
          title.length > 20 &&
          !title.includes('Новости') &&
          !title.includes('Назад') &&
          !title.includes('Вперед');

        if (!isNewsLink) return;

        if (!url.startsWith('http')) {
          url = `https://region-tyumen.ru${url}`;
        }

        const parentText = $(element).parent().text().trim();

        const dateMatch = parentText.match(
          /\d{2}\.\d{2}\.\d{4}\s+\d{2}:\d{2}/,
        );

        news.push({
          id: news.length + 1,
          title,
          description: '',
          url,
          imageUrl,
          publishedAt: dateMatch ? dateMatch[0] : new Date().toISOString(),
        });
      });

      return news;
    } catch (error) {
      console.error(error);

      return [
        {
          id: 1,
          title: 'Ошибка подключения к сайту',
          description: 'Проверьте доступность внешнего сайта.',
          url: 'https://region-tyumen.ru/articles/',
          publishedAt: new Date().toISOString(),
        },
      ];
    }
  }
}