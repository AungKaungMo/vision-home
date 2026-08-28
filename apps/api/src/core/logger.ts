type LogLevel = "info" | "warn" | "error";

type LogMeta = Record<string, unknown>;

// Minimal structured logger: one JSON object per line so logs stay
// grep-able locally and parseable by a log aggregator in production.
function write(level: LogLevel, message: string, meta?: LogMeta): void {
  const entry = {
    level,
    time: new Date().toISOString(),
    message,
    ...(meta ? { meta } : {}),
  };

  const line = JSON.stringify(entry);

  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  info: (message: string, meta?: LogMeta) => write("info", message, meta),
  warn: (message: string, meta?: LogMeta) => write("warn", message, meta),
  error: (message: string, meta?: LogMeta) => write("error", message, meta),
};
