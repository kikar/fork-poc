import { registerAs } from '@nestjs/config';
import { z } from 'zod';
import { LoggerLevel, ServerEnvironmentType } from './logger.constants';

const configSchema = z.object({
  LOGGER_LEVEL: z.nativeEnum(LoggerLevel).default(LoggerLevel.Info),
  SERVER_ENVIRONMENT: z.nativeEnum(ServerEnvironmentType).optional(),
});

export const loggerConfig = registerAs('logger', () => {
  const parsed = configSchema.parse(process.env);
  return { level: parsed.LOGGER_LEVEL, env: parsed.SERVER_ENVIRONMENT };
});
