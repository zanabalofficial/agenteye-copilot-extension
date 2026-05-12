export const config = {
  server: {
    port: Number(process.env.PORT ?? 3000),
    host: process.env.HOST ?? "0.0.0.0",
  },
  ai: {
    provider: process.env.AI_PROVIDER ?? "openrouter",
    apiKey: process.env.OPENROUTER_API_KEY ?? process.env.AI_API_KEY ?? "",
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
