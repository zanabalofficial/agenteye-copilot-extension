import { config } from "./config.ts";
import { SYSTEM_PROMPT, REVIEW_PROMPT } from "./prompts.ts";

interface ReviewIssue {
  severity: string;
  file: string;
  line: string;
  title: string;
  problem: string;
  fix: string;
}

interface ReviewResult {
  issues: ReviewIssue[];
  rawText: string;
  summary: string;
}

/**
 * Sends code to the AI provider for review and parses the structured response.
 */
export async function reviewCode(params: {
  language: string;
  code: string;
  userMessage: string;
  fileName?: string;
}): Promise<ReviewResult> {
  const { language, code, userMessage, fileName } = params;

  if (!code.trim()) {
    return {
      issues: [],
      rawText: "",
      summary: "ℹ️ No code to review.",
    };
  }

  if (code.length > config.review.maxFileSize) {
    const truncated = code.slice(0, config.review.maxFileSize);
    return reviewCode({ language, code: truncated, userMessage, fileName });
  }

  const prompt = REVIEW_PROMPT(language, code, userMessage);

  try {
    const response = await fetch(config.ai.baseUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${config.ai.apiKey}`,
        ...(config.ai.provider === "openrouter" && {
          "HTTP-Referer": "https://github.com/zanabalofficial/agenteye-copilot-extension",
          "X-Title": "AgentEye Code Review",
        }),
      },
      body: JSON.stringify({
        model: config.ai.model,
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: prompt },
        ],
        max_tokens: config.ai.maxTokens,
        temperature: config.ai.temperature,
        stream: false,
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(
        `AI API error (${response.status}): ${errBody.slice(0, 200)}`
      );
    }

    const data = await response.json();
    const rawText =
      data.choices?.[0]?.message?.content ??
      data.content ??
      JSON.stringify(data);

    const issues = parseReviewIssues(rawText, fileName ?? "");
    const summary = generateSummary(issues);

    return { issues, rawText, summary };
  } catch (error) {
    console.error("Review error:", error);
    return {
      issues: [],
      rawText: "",
      summary: `❌ Review failed: ${error instanceof Error ? error.message : "Unknown error"}`,
    };
  }
}

/**
 * Parse the structured review output into typed issues.
 */
function parseReviewIssues(rawText: string, fileName: string): ReviewIssue[] {
  if (rawText.includes("✅ No issues found")) return [];

  const issues: ReviewIssue[] = [];
  const lines = rawText.split("\n");
  let current: Partial<ReviewIssue> | null = null;

  const severityEmoji: Record<string, string> = {
    "🔴": "CRITICAL",
    "🟠": "HIGH",
    "🟡": "MEDIUM",
    "🔵": "LOW",
    "ℹ️": "INFO",
  };

  for (const line of lines) {
    // Detect issue header: [SEVERITY] FILE:LINE — Title
    const headerMatch = line.match(
      /([🔴🟠🟡🔵ℹ️])\s*(\w+)\s*\|\s*([^\s:]+):?(\d+)?\s*[—–-]\s*(.+)/
    );
    if (headerMatch) {
      if (current && current.title) {
        issues.push(current as ReviewIssue);
      }
      const [, emoji, severity, file, lineNum, title] = headerMatch;
      current = {
        severity: emoji ? `${emoji} ${severity}` : severity,
        file: file || fileName,
        line: lineNum || "",
        title: title.trim(),
        problem: "",
        fix: "",
      };
      continue;
    }

    // Detect Problem: / Fix: lines
    if (current) {
      const problemMatch = line.match(/^Problem:\s*(.+)/i);
      const fixMatch = line.match(/^Fix:\s*(.+)/i);
      if (problemMatch) {
        current.problem = problemMatch[1].trim();
      } else if (fixMatch) {
        current.fix = fixMatch[1].trim();
      }
    }
  }

  if (current && current.title) {
    issues.push(current as ReviewIssue);
  }

  return issues;
}

/**
 * Generate a one-line summary of the review.
 */
function generateSummary(issues: ReviewIssue[]): string {
  if (issues.length === 0) return "✅ No issues found.";

  const critical = issues.filter((i) => i.severity.includes("CRITICAL")).length;
  const high = issues.filter((i) => i.severity.includes("HIGH")).length;
  const medium = issues.filter((i) => i.severity.includes("MEDIUM")).length;
  const low = issues.filter((i) => i.severity.includes("LOW")).length;

  const parts: string[] = [];
  if (critical) parts.push(`🔴 ${critical} critical`);
  if (high) parts.push(`🟠 ${high} high`);
  if (medium) parts.push(`🟡 ${medium} medium`);
  if (low) parts.push(`🔵 ${low} low`);

  return parts.length > 0
    ? `Found ${issues.length} issue(s): ${parts.join(", ")}`
    : "✅ No issues found.";
}
