type LogMeta = Record<string, unknown>;

const serializeMeta = (meta?: LogMeta) => {
  if (!meta) return undefined;
  try {
    return JSON.stringify(meta);
  } catch {
    return String(meta);
  }
};

export const logInfo = (message: string, meta?: LogMeta) => {
  if (!__DEV__) return;
  const details = serializeMeta(meta);
  // eslint-disable-next-line no-console
  console.log(`[INFO] ${message}`, details ?? '');
};

export const logWarn = (message: string, meta?: LogMeta) => {
  if (!__DEV__) return;
  const details = serializeMeta(meta);
  // eslint-disable-next-line no-console
  console.warn(`[WARN] ${message}`, details ?? '');
};

export const logError = (message: string, meta?: LogMeta) => {
  const details = serializeMeta(meta);
  // eslint-disable-next-line no-console
  console.error(`[ERROR] ${message}`, details ?? '');
};
