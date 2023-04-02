import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import axios, { AxiosError, AxiosHeaders, AxiosRequestConfig, Method } from 'axios';
import { XMLParser } from 'fast-xml-parser';
import { HttpsProxyAgent } from 'https-proxy-agent';
import { setTimeout } from 'node:timers';
import { setTimeout as setTimeoutPromise } from 'node:timers/promises';
import { LoggerService } from '../ox-logger/logger.service';
import { httpConfig } from './http.config';
import { HttpError, HttpResponse, HttpTimeoutError, JSONValue, RequestConfig, RetryStrategy, RetryStrategyType } from './http.types';

@Injectable()
export class HttpService {
  private readonly DEFAULT_TIMEOUT = 10000; // 10 seconds
  private readonly DEFAULT_RETRY_WAIT = 100; // 0.1 seconds
  private readonly DEFAULT_RETRIES = 1;
  private readonly parser = new XMLParser();
  private readonly proxyAgent?: HttpsProxyAgent;

  constructor(private readonly logger: LoggerService, @Inject(httpConfig.KEY) config: ConfigType<typeof httpConfig>) {
    if (config.proxyUrl) {
      this.proxyAgent = new HttpsProxyAgent(config.proxyUrl);
    }
  }

  async get<TResponseData>(url: string, config?: RequestConfig): Promise<HttpResponse<TResponseData>> {
    return this.request('GET', url, config);
  }

  async post<TResponseData>(url: string, config?: RequestConfig): Promise<HttpResponse<TResponseData>> {
    return this.request('POST', url, config);
  }

  async put<TResponseData>(url: string, config?: RequestConfig): Promise<HttpResponse<TResponseData>> {
    return this.request('PUT', url, config);
  }

  async patch<TResponseData>(url: string, config?: RequestConfig): Promise<HttpResponse<TResponseData>> {
    return this.request('PATCH', url, config);
  }

  async delete<TResponseData>(url: string, config?: RequestConfig): Promise<HttpResponse<TResponseData>> {
    return this.request('DELETE', url, config);
  }

  async head<TResponseData>(url: string, config?: RequestConfig): Promise<HttpResponse<TResponseData>> {
    return this.request('HEAD', url, config);
  }

  async request<TResponseData>(method: Method, url: string, config: RequestConfig = {}, retries = 1): Promise<HttpResponse<TResponseData>> {
    try {
      const startTime = Date.now();
      this.logger.debug(`${method} ${url} (try: ${retries})`);
      const reqConfig = this.prepareReqConfig(method, url, config);
      this.logger.debug(JSON.stringify(reqConfig));
      const { data, status } = await axios.request(reqConfig);
      this.logger.debug(`Successful request (${Date.now() - startTime}ms): ${method} ${url} (try: ${retries})`);
      return new HttpResponse(data, status);
    } catch (err) {
      this.logger.error(`Failed ${method} ${url} (try: ${retries}): ${this.printError(err)}`);
      if (retries < (config.retry?.retries || this.DEFAULT_RETRIES)) {
        await setTimeoutPromise(this.getAwaitTimeFromStrategy(retries, config.retry));
        return this.request(method, url, config, retries + 1);
      }
      if (this.isAxiosError(err)) {
        throw new HttpError(err.response?.data, err.response?.status);
      }
      if (axios.isCancel(err)) {
        throw new HttpTimeoutError('Request timed out');
      }
      throw err;
    }
  }

  private isAxiosError(err: unknown): err is AxiosError {
    return (err as AxiosError)?.isAxiosError && !!(err as AxiosError).response;
  }

  private prepareReqConfig(
    method: Method,
    url: string,
    { queryParams: params, body: data, headers, maxRedirects, timeout, jwt, basicAuth, xml }: RequestConfig,
  ): AxiosRequestConfig<JSONValue> {
    const controller = new AbortController();
    const reqConfig: AxiosRequestConfig<JSONValue> = { method, url, params, signal: controller.signal, data, maxRedirects };
    if (headers || jwt) {
      reqConfig.headers = new AxiosHeaders(headers);
      if (jwt) {
        reqConfig.headers.set('Authorization', `Bearer ${jwt}`);
      }
    }
    if (basicAuth) {
      reqConfig.auth = basicAuth;
    }
    if (xml) {
      reqConfig.transformResponse = (data: string) => this.parser.parse(data);
    }
    if (this.proxyAgent) {
      reqConfig.proxy = false;
      reqConfig.httpsAgent = this.proxyAgent;
    }
    setTimeout(() => controller.abort(), timeout || this.DEFAULT_TIMEOUT);
    return reqConfig;
  }

  private printError(err: unknown): string {
    if (this.isAxiosError(err) && err.response?.data) {
      return JSON.stringify(err.response?.data);
    }
    if (err instanceof Error) {
      return err.message;
    }
    return String(err);
  }

  private getAwaitTimeFromStrategy(retry: number, strategy?: RetryStrategy): number {
    if (strategy?.type === RetryStrategyType.Exponential) {
      return (strategy?.time ?? this.DEFAULT_RETRY_WAIT) * 2 ** retry;
    }
    return strategy?.time ?? this.DEFAULT_RETRY_WAIT;
  }
}
