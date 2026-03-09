type LogData = Record<string, unknown>;

const methods = {
  info: console.log,
  warn: console.warn,
  error: console.error,
} as const;

const format = (level: keyof typeof methods, msg: string, data?: LogData) => {
  methods[level](JSON.stringify({ level, msg, ...data, ts: Date.now() }));
};

export const log = {
  info: (msg: string, data?: LogData) => format("info", msg, data),
  warn: (msg: string, data?: LogData) => format("warn", msg, data),
  error: (msg: string, data?: LogData) => format("error", msg, data),
};
