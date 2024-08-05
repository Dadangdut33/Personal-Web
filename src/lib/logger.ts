import pino, { Logger as PinoLogger, type LogFn } from 'pino';
import { createPinoBrowserSend, createWriteStream } from 'pino-logflare';

import { env, isProd } from './env.mjs';

let pinoLog: PinoLogger;
export const getLogger = () => {
  if (!pinoLog) {
    // create pino-logflare stream
    const stream = createWriteStream({
      apiKey: env.LOGFLARE_API_KEY,
      sourceToken: env.LOGFLARE_SOURCE_TOKEN,
    });

    // create pino-logflare browser stream
    const send = createPinoBrowserSend({
      apiKey: env.LOGFLARE_API_KEY,
      sourceToken: env.LOGFLARE_SOURCE_TOKEN,
    });

    pinoLog = pino(
      {
        base: {
          env: process.env.VERCEL_ENV,
          revision: process.env.VERCEL_GITHUB_COMMIT_SHA,
        },
        level: isProd ? 'info' : 'debug',
        browser: {
          transmit: {
            send: send,
          },
        },
      },
      stream
    );
  }
  return pinoLog;
};

export class Logger {
  info: LogFn;
  debug: LogFn;
  trace: LogFn;
  warn: LogFn;
  error: LogFn;
  fatal: LogFn;

  constructor() {
    this.info = this.log.bind(this, 'info') as LogFn;
    this.debug = this.log.bind(this, 'debug') as LogFn;
    this.trace = this.log.bind(this, 'trace') as LogFn;
    this.warn = this.log.bind(this, 'warn') as LogFn;
    this.error = this.log.bind(this, 'error') as LogFn;
    this.fatal = this.log.bind(this, 'fatal') as LogFn;
  }

  private log(
    level: 'info' | 'debug' | 'trace' | 'warn' | 'error' | 'fatal',
    objOrMsg: any,
    msg?: string,
    ...args: any[]
  ) {
    try {
      switch (level) {
        case 'info':
          this.logInfo(objOrMsg, msg, ...args);
          break;
        case 'debug':
          this.logDebug(objOrMsg, msg, ...args);
          break;
        case 'trace':
          this.logTrace(objOrMsg, msg, ...args);
          break;
        case 'warn':
          this.logWarn(objOrMsg, msg, ...args);
          break;
        case 'error':
          this.logError(objOrMsg, msg, ...args);
          break;
        case 'fatal':
          this.logFatal(objOrMsg, msg, ...args);
          break;
      }
    } catch (error) {
      console.log('Error sending log: ', error);
    }
  }

  private logInfo(objOrMsg: any, msg?: string, ...args: any[]) {
    if (typeof objOrMsg === 'string') {
      getLogger().info(objOrMsg, ...args);
      console.log('INFO', objOrMsg, ...args);
    } else {
      getLogger().info(objOrMsg, msg, ...args);
      console.log('INFO', objOrMsg, msg, ...args);
    }
  }

  private logDebug(objOrMsg: any, msg?: string, ...args: any[]) {
    if (typeof objOrMsg === 'string') {
      getLogger().debug(objOrMsg, ...args);
      console.log('DEBUG', objOrMsg, ...args);
    } else {
      getLogger().debug(objOrMsg, msg, ...args);
      console.log('DEBUG', objOrMsg, msg, ...args);
    }
  }

  private logTrace(objOrMsg: any, msg?: string, ...args: any[]) {
    if (typeof objOrMsg === 'string') {
      getLogger().trace(objOrMsg, ...args);
      console.log('TRACE', objOrMsg, ...args);
    } else {
      getLogger().trace(objOrMsg, msg, ...args);
      console.log('TRACE', objOrMsg, msg, ...args);
    }
  }

  private logWarn(objOrMsg: any, msg?: string, ...args: any[]) {
    if (typeof objOrMsg === 'string') {
      getLogger().warn(objOrMsg, ...args);
      console.log('WARN', objOrMsg, ...args);
    } else {
      getLogger().warn(objOrMsg, msg, ...args);
      console.log('WARN', objOrMsg, msg, ...args);
    }
  }

  private logError(objOrMsg: any, msg?: string, ...args: any[]) {
    if (typeof objOrMsg === 'string') {
      getLogger().error(objOrMsg, ...args);
      console.log('ERROR', objOrMsg, ...args);
    } else {
      getLogger().error(objOrMsg, msg, ...args);
      console.log('ERROR', objOrMsg, msg, ...args);
    }
  }

  private logFatal(objOrMsg: any, msg?: string, ...args: any[]) {
    if (typeof objOrMsg === 'string') {
      getLogger().fatal(objOrMsg, ...args);
      console.log('FATAL', objOrMsg, ...args);
    } else {
      getLogger().fatal(objOrMsg, msg, ...args);
      console.log('FATAL', objOrMsg, msg, ...args);
    }
  }
}

export const logger = new Logger();
