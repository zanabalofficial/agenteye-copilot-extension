import { readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Try to find an OpenRouter API key from Hermes auth.json if env vars aren't set.
 */
function findApiKey(): string {
  const fromEnv = process.env.OPENROUTER_API_KEY ?? process.env.AI_API_KEY ?? "";
  if (fromEnv) return fromEnv;
  try {
    const authPath = join(homedir(), "AppData", "Local", "hermes", "auth.json");
    const auth = JSON.parse(readFileSync(authPath, "utf8"));
    return auth.credential_pool?.openrouter?.[0]?.access_token ?? "";
  } catch {
    return "";
  }
}

export const config = {
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "0.0.0.0",
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? "openrouter",
    apiKey: findApiKey(),
    baseUrl:
      process.env.AI_BASE_URL ?? "https://openrouter.ai/api/v1/chat/completions",
    model: process.env.AI_MODEL ?? "anthropic/claude-sonnet-4",
    maxTokens: Number(process.env.AI_MAX_TOKENS ?? 2048),
    temperature: Number(process.env.AI_TEMPERATURE ?? 0.3),
  },
  review: {
    maxFileSize: Number(process.env.MAX_FILE_SIZE ?? 100_000),
    reviewTypes: (process.env.REVIEW_TYPES ?? "bug,security,performance,style,architecture")
      .split(",")
      .map((s) => s.trim()),
    severityThreshold: process.env.SEVERITY_THRESHOLD ?? "info",
  },
  branding: {
    name: "AgentEye",
    emoji: "🔍",
    tagline: "AI Code Review",
  },
};
