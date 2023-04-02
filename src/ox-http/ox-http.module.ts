import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OxLoggerModule } from '../ox-logger/ox-logger.module';
import { httpConfig } from './http.config';
import { HttpService } from './http.service';

@Module({
  imports: [OxLoggerModule, ConfigModule.forFeature(httpConfig)],
  providers: [HttpService],
  exports: [HttpService],
})
export class OxHttpModule {}
