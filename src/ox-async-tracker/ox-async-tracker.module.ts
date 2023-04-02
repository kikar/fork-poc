import { Module } from '@nestjs/common';
import { AsyncTrackerService } from './async-tracker.service';

@Module({
  providers: [AsyncTrackerService],
  exports: [AsyncTrackerService],
})
export class OxAsyncTrackerModule {}
