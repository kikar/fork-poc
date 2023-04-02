import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

@Schema()
export class Fork {
  @Prop()
  name!: string;
  @Prop()
  size!: number;
}

export type ForkDocument = HydratedDocument<Fork>;
export const ForkSchema = SchemaFactory.createForClass(Fork);
ForkSchema.index({ name: 'text', size: 1 }, { unique: true });
