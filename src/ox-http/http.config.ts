import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const configSchema = z.object({
  http_proxy: z.string().url().optional(),
});

export const httpConfig = registerAs('http', () => {
  const parsed = configSchema.parse(process.env);
  return { proxyUrl: parsed.http_proxy };
});
