import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { OxDbModule } from './ox-db/ox-db.module';
import { OxHttpModule } from './ox-http/ox-http.module';
import { OxLoggerModule } from './ox-logger/ox-logger.module';

@Module({
  imports: [ConfigModule.forRoot(), OxLoggerModule, OxHttpModule, OxDbModule],
})
export class AppModule {}
