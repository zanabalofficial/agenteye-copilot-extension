import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { stream } from "hono/streaming";
import {
  createAckEvent,
  createDoneEvent,
  createErrorsEvent,
  createTextEvent,
  verifyAndParseRequest,
} from "@copilot-extensions/preview-sdk";
import type { CopilotRequestPayload } from "@copilot-extensions/preview-sdk";
import { config } from "./config.ts";
import { reviewCode } from "./reviewer.ts";

// Extend SDK types for copilot_references
declare module "@copilot-extensions/preview-sdk" {
  interface CopilotReferenceData {
    language: string;
    content: string;
  }
}

const app = new Hono();

console.log(
  `🔍 ${config.branding.name} — ${config.branding.tagline}`,
);
console.log(`   Model: ${config.ai.model}`);
console.log(`   Provider: ${config.ai.provider}`);
console.log(`   Review focus: ${config.review.reviewTypes.join(", ")}`);

// Health check
app.get("/", (c) => {
  return c.json({
    name: config.branding.name,
    version: "1.0.0",
    description: config.branding.tagline,
    model: config.ai.model,
    status: "ok",
  });
});

// Main Copilot endpoint
app.post("/", async (c) => {
  const tokenForUser = c.req.header("X-GitHub-Token") ?? "";
  const body = await c.req.text();
  const signature = c.req.header("github-public-key-signature") ?? "";
  const keyID = c.req.header("github-public-key-identifier") ?? "";

  // Verify the request is from GitHub
  const { isValidRequest, payload } = await verifyAndParseRequest(
    body,
    signature,
    keyID,
    { token: tokenForUser },
  );

  if (!isValidRequest) {
    console.error("❌ Invalid request signature");
    return c.text(
      createErrorsEvent([
        {
          type: "agent",
          message: "Failed to verify request signature.",
          code: "INVALID_REQUEST",
          identifier: "invalid_request",
        },
      ]),
    );
  }

  if (!tokenForUser) {
    return c.text(
      createErrorsEvent([
        {
          type: "agent",
          message: "No GitHub token provided.",
          code: "MISSING_GITHUB_TOKEN",
          identifier: "missing_github_token",
        },
      ]),
    );
  }

  // Extract user message and code context
  const { userMessage, codeContext } = extractContext(payload);

  if (!codeContext) {
    c.header("Content-Type", "text/html");
    c.header("X-Content-Type-Options", "nosniff");
    return stream(c, async (s) => {
      s.write(createAckEvent());
      s.write(
        createTextEvent(
          "👋 I'm AgentEye, your AI code reviewer!\n\n" +
            "To use me:\n" +
            "1. Open a file in your editor\n" +
            "2. Ask me to review it: '@agenteye review this file'\n" +
            "3. Or select code and ask: '@agenteye review this function'\n\n" +
            "I'll check for bugs, security issues, performance problems, and code style.",
        ),
      );
      s.write(createDoneEvent());
    });
  }

  console.log(
    `📝 Review request: ${codeContext.fileName} (${codeContext.language}, ${codeContext.code.length} chars)`,
  );
  console.log(`   User message: "${userMessage.slice(0, 100)}"`);

  c.header("Content-Type", "text/html");
  c.header("X-Content-Type-Options", "nosniff");

  return stream(c, async (s) => {
    try {
      s.write(createAckEvent());

      s.write(
        createTextEvent(
          `🔍 **${config.branding.name}** reviewing \`${codeContext.fileName}\`...\n\n`,
        ),
      );

      const result = await reviewCode({
        language: codeContext.language,
        code: codeContext.code,
        userMessage,
        fileName: codeContext.fileName,
      });

      // Write the review
      s.write(createTextEvent(result.rawText));

      // Write summary
      s.write(createTextEvent(`\n---\n**${result.summary}**`));

      s.write(createDoneEvent());
    } catch (error) {
      console.error("❌ Stream error:", error);
      s.write(
        createErrorsEvent([
          {
            type: "agent",
            message:
              error instanceof Error ? error.message : "Review failed",
            code: "REVIEW_ERROR",
            identifier: "review_error",
          },
        ]),
      );
    }
  });
});

/**
 * Extract user message and code context from the Copilot request payload.
 */
function extractContext(payload: CopilotRequestPayload): {
  userMessage: string;
  codeContext: { language: string; code: string; fileName: string } | null;
} {
  const [firstMessage] = payload.messages;
  const userMessage = firstMessage?.content ?? "";

  // Try to get file references first
  const fileRefs =
    firstMessage?.copilot_references?.filter(
      (ref) =>
        ref.type === "client.file" || ref.type === "client.selection",
    ) ?? [];

  if (fileRefs.length > 0) {
    const ref = fileRefs[0]!;
    return {
      userMessage,
      codeContext: {
        language: (ref.data as any)?.language ?? "text",
        code: (ref.data as any)?.content ?? "",
        fileName: ref.id ?? "unknown",
      },
    };
  }

  // No code context found
  return { userMessage, codeContext: null };
}

// Start server
console.log(`\n🚀 Server starting on port ${config.server.port}...`);

serve({
  fetch: app.fetch,
  port: config.server.port,
  hostname: config.server.host,
});
