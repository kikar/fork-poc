export class HttpResponse<TData> {
  constructor(public data: TData, public status: number) {}
}

export class HttpError extends Error {
  public name = HttpError.name;
  constructor(public data?: unknown, public status?: number) {
    super();
  }
}

export class HttpTimeoutError extends Error {
  public name = HttpTimeoutError.name;
}

export enum RetryStrategyType {
  Static = 'static',
  Exponential = 'exponential',
}

export interface RetryStrategy {
  /**
   * How many time should the request be tried
   */
  retries: number;
  type?: RetryStrategyType;
  /**
   * How long to wait between each reties
   */
  time?: number;
}

export type JSONValue = string | number | boolean | { [x: string]: JSONValue } | JSONValue[];

export interface RequestConfig {
  queryParams?: Record<string, JSONValue>;
  maxRedirects?: number;
  timeout?: number;
  body?: JSONValue;
  jwt?: string;
  headers?: Record<string, string>;
  retry?: RetryStrategy;
  basicAuth?: { username: string; password: string };
  xml?: boolean;
}
