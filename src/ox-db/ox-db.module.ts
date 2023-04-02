import { Module } from '@nestjs/common';
import { ConfigModule, ConfigType } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { dbConfig } from './db.config';
import { ModelService } from './model.service';

@Module({
  imports: [
    ConfigModule.forFeature(dbConfig),
    MongooseModule.forRootAsync({
      imports: [ConfigModule.forFeature(dbConfig)],
      inject: [dbConfig.KEY],
      useFactory: async (config: ConfigType<typeof dbConfig>) => config.mongooseConfig,
    }),
  ],
  providers: [ModelService],
  exports: [ModelService],
})
export class OxDbModule {}
