import { Inject, Injectable } from '@nestjs/common';
import { ConfigType } from '@nestjs/config';
import { ulid } from 'ulid';
import { createLogger, format, Logger, transports } from 'winston';
import { OX_STORE_PREFIX } from '../ox-async-tracker/async-tracker.constants';
import { AsyncTrackerService } from '../ox-async-tracker/async-tracker.service';
import { loggerConfig } from './logger.config';
import { ServerEnvironmentType } from './logger.constants';

@Injectable()
export class LoggerService {
  private _logger: Logger;
  private _id = ulid().toLowerCase();

  constructor(
    @Inject(loggerConfig.KEY) private readonly config: ConfigType<typeof loggerConfig>,
    private readonly asyncTracker: AsyncTrackerService,
  ) {
    this._logger = createLogger({ level: this.getLoggerMinLevel(config), format: format.json() });
    this._logger.add(new transports.Console({ format: format.combine(...this.getConsoleFormat(config)) }));
  }

  debug(msg: string): void {
    this._logger.debug(msg, this.addCorrelatedInfo());
  }

  info(msg: string): void {
    this._logger.info(msg, this.addCorrelatedInfo());
  }

  warn(msg: string): void {
    this._logger.warn(msg, this.addCorrelatedInfo());
  }

  error(msg: string): void {
    this._logger.error(msg, this.addCorrelatedInfo());
  }

  private addCorrelatedInfo(): Record<string, unknown> {
    return { ...this.asyncTracker.getLoggerInfo(), [`${OX_STORE_PREFIX}instance-id`]: this._id };
  }

  private getLoggerMinLevel(config: ConfigType<typeof loggerConfig>): string {
    return config.level;
  }

  private getConsoleFormat(config: ConfigType<typeof loggerConfig>): Parameters<typeof format.combine> {
    return config.env &&
      [
        ServerEnvironmentType.Development,
        ServerEnvironmentType.Staging,
        ServerEnvironmentType.Beta,
        ServerEnvironmentType.Production,
        ServerEnvironmentType.Testing,
      ].includes(config.env)
      ? [format.timestamp(), format.json()]
      : [format.colorize(), format.simple()];
  }
}
