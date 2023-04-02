import { Injectable } from '@nestjs/common';
import { AsyncLocalStorage } from 'node:async_hooks';
import { OX_STORE_PREFIX } from './async-tracker.constants';

@Injectable()
export class AsyncTrackerService {
  private readonly asyncLocalStorage = new AsyncLocalStorage<Map<string, unknown>>();

  runWithAsyncTracker<TArgs extends unknown[], TResult>(func: (...args: TArgs) => TResult, ...args: TArgs) {
    return this.asyncLocalStorage.run<TResult, TArgs>(new Map(), func, ...args);
  }

  setValue(key: string, val: unknown): void {
    const store = this.asyncLocalStorage.getStore();
    store?.set(key, val);
    return;
  }

  getValue(key: string): unknown {
    const store = this.asyncLocalStorage.getStore();
    return store?.get(key);
  }

  /**
   * Will return an object containing all entries of the store that have key prefixed with "ox-"
   */
  getLoggerInfo(): Record<string, unknown> | undefined {
    const store = this.asyncLocalStorage.getStore();
    if (!store) {
      return;
    }
    return Object.fromEntries([...store.entries()].filter(([key]) => key.startsWith(OX_STORE_PREFIX)));
  }
}
