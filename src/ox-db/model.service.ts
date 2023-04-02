import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, Model, Schema } from 'mongoose';
import { dbConfig } from './db.config';
import { ClassType } from './db.interfaces';

@Injectable()
export class ModelService {
  constructor(
    @Inject(dbConfig.KEY) private readonly config: ConfigType<typeof dbConfig>,
    @InjectConnection() private connection: Connection,
  ) {}

  getModel<TClass>(doc: ClassType<TClass>, schema: Schema<TClass>, dbName = this.config.defaultDb): Model<TClass> {
    if (!dbName) {
      throw new Error('Missing DB name');
    }
    return this.connection.useDb(dbName, { useCache: true }).model<TClass>(doc.name, schema);
  }
}
