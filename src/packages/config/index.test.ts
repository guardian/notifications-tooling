import { afterEach, describe, expect, it } from "bun:test";
import { getConfigValue } from "./index";

const ORIGINAL_APP_CONFIG_JSON = process.env["APP_CONFIG_JSON"];
const ORIGINAL_CAPI_API_KEY = process.env["CAPI_API_KEY"];

afterEach(() => {
  if (ORIGINAL_APP_CONFIG_JSON === undefined) {
    delete process.env["APP_CONFIG_JSON"];
  } else {
    process.env["APP_CONFIG_JSON"] = ORIGINAL_APP_CONFIG_JSON;
  }

  if (ORIGINAL_CAPI_API_KEY === undefined) {
    delete process.env["CAPI_API_KEY"];
  } else {
    process.env["CAPI_API_KEY"] = ORIGINAL_CAPI_API_KEY;
  }
});

describe("getConfigValue", () => {
  it("reads config values from APP_CONFIG_JSON", () => {
    process.env["APP_CONFIG_JSON"] = JSON.stringify({
      CAPI_API_KEY: "json-capi-key",
    });
    delete process.env["CAPI_API_KEY"];

    expect(getConfigValue("CAPI_API_KEY")).toBe("json-capi-key");
  });

  it("falls back to the matching environment variable", () => {
    delete process.env["APP_CONFIG_JSON"];
    process.env["CAPI_API_KEY"] = "env-capi-key";

    expect(getConfigValue("CAPI_API_KEY")).toBe("env-capi-key");
  });

  it("returns the provided default when no config value exists", () => {
    delete process.env["APP_CONFIG_JSON"];
    delete process.env["CAPI_API_KEY"];

    expect(getConfigValue("missingKey", "default-value")).toBe("default-value");
  });

  it("re-reads APP_CONFIG_JSON when the env value changes", () => {
    process.env["APP_CONFIG_JSON"] = JSON.stringify({
      CAPI_API_KEY: "first-json-capi-key",
    });

    expect(getConfigValue("CAPI_API_KEY")).toBe("first-json-capi-key");

    process.env["APP_CONFIG_JSON"] = JSON.stringify({
      CAPI_API_KEY: "second-json-capi-key",
    });

    expect(getConfigValue("CAPI_API_KEY")).toBe("second-json-capi-key");
  });
});
