import { config } from '../../config';

const levels = {
  error: 0,
  warn: 1,
  info: 2,
  debug: 3,
} as const;

type LogLevel = keyof typeof levels;

const colors: Record<LogLevel, string> = {
  error: '\x1b[31m',
  warn: '\x1b[33m',
  info: '\x1b[36m',
  debug: '\x1b[90m',
};

const reset = '\x1b[0m';

function formatMessage(level: LogLevel, message: string, meta?: any): string {
  const timestamp = new Date().toISOString();

  if (config.NODE_ENV === 'production') {
    return JSON.stringify({ timestamp, level, message, ...meta });
  }

  const color = colors[level];
  const metaStr = meta ? ` ${JSON.stringify(meta)}` : '';
  return `${color}[${timestamp}] [${level.toUpperCase()}]${reset} ${message}${metaStr}`;
}

function log(level: LogLevel, message: string, meta?: any) {
  const currentLevel = config.NODE_ENV === 'development' ? 'debug' : 'info';
  if (levels[level] <= levels[currentLevel]) {
    const formatted = formatMessage(level, message, meta);
    if (level === 'error') {
      console.error(formatted);
    } else if (level === 'warn') {
      console.warn(formatted);
    } else {
      console.log(formatted);
    }
  }
}

export const logger = {
  error: (message: string, meta?: any) => log('error', message, meta),
  warn: (message: string, meta?: any) => log('warn', message, meta),
  info: (message: string, meta?: any) => log('info', message, meta),
  debug: (message: string, meta?: any) => log('debug', message, meta),
};
