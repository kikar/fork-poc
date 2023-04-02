import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Fork, ForkSchema } from './forks.schema';
import { ModelService } from './ox-db/model.service';
import { HttpService } from './ox-http/http.service';
import { LoggerService } from './ox-logger/logger.service';

const githubToken = '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';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { logger: process.env.DEBUG ? undefined : ['error'] });
  app.enableShutdownHooks();
  await app.init();
  const logger = app.get(LoggerService);
  const dbModel = app.get(ModelService);
  const http = app.get(HttpService);

  const model = dbModel.getModel(Fork, ForkSchema, 'prova');
  await model.create({ name: 'ox-simple-scraper', size: 500 }).catch(err => logger.info('already exists '));

  const response = await http.get<GithubResponse>('https://api.github.com/search/repositories', {
    jwt: githubToken,
    queryParams: {
      q: `size:>0 created:>${new Date(Date.now() - 60 * 60 * 1000).toISOString()}`,
      sort: 'updated',
      order: 'desc',
      page: '0',
      per_page: '100',
    },
    headers: { Accept: 'application/vnd.github+json' },
  });

  console.log(response.data.total_count);

  const found = await Promise.all(
    response.data.items.map(item => model.find({ $text: { $search: item.name }, size: { $gt: item.size - 10, $lt: item.size + 10 } })),
  );

  logger.info('Shutting down...');
  await app.close();
  logger.info('Service shut down. Bye!');
  process.exit(0);
}
bootstrap();

interface GithubRepository {
  id: number;
  name: string;
  full_name: string;
  size: number;
  language: string;
}

interface GithubResponse {
  total_count: number;
  items: GithubRepository[];
}
