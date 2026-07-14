type ConfigMap = Record<string, string>;

const readConfigFromJsonEnv = (): ConfigMap | undefined => {
  const rawConfig = process.env["APP_CONFIG_JSON"];

  if (!rawConfig) {
    return undefined;
  }

  try {
    return JSON.parse(rawConfig) as ConfigMap;
  } catch {
    throw new Error("APP_CONFIG_JSON contains invalid JSON.");
  }
};

export const getConfigValue = (key: string, defaultValue?: string): string => {
  const configFromJson = readConfigFromJsonEnv();

  if (configFromJson?.[key]) {
    return configFromJson[key];
  }

  const value = process.env[key]?.trim();

  if (value) {
    return value;
  }

  if (defaultValue !== undefined) {
    return defaultValue;
  }

  throw new Error(`No config value found for key: ${key}`);
};
