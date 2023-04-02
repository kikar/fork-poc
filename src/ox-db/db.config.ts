import { registerAs } from '@nestjs/config';
import { z } from 'zod';

const configSchema = z.object({
  MONGODB_URI: z.string().url(),
  SERVICE_NAME: z.string().min(1),
  DB_NAME: z.string().min(1).optional(),
});

export const dbConfig = registerAs('db', () => {
  const parsed = configSchema.parse(process.env);
  return { mongooseConfig: { uri: parsed.MONGODB_URI, appName: parsed.SERVICE_NAME }, defaultDb: parsed.DB_NAME };
});
