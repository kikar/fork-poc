import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OxAsyncTrackerModule } from '../ox-async-tracker/ox-async-tracker.module';
import { loggerConfig } from './logger.config';
import { LoggerService } from './logger.service';

@Module({
  imports: [OxAsyncTrackerModule, ConfigModule.forFeature(loggerConfig)],
  providers: [LoggerService],
  exports: [LoggerService],
})
export class OxLoggerModule {}
