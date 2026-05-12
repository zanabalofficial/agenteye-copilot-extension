# 🔍 AgentEye — AI Code Review Copilot Extension

<div align="center">

**Your AI code reviewer that works inside GitHub Copilot**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Node.js](https://img.shields.io/badge/Node.js-%3E%3D22.13.1-green)](https://nodejs.org/)

</div>

AgentEye is a GitHub Copilot Extension that reviews your code as you work. Catch bugs, security vulnerabilities, and performance issues **before they reach PR review.**

## ✨ Features

- 🔴 **Bug Detection** — Find logic errors, edge cases, null handling issues
- 🔒 **Security Scanning** — SQL injection, XSS, exposed secrets, unsafe operations
- ⚡ **Performance Analysis** — O(n²) patterns, unnecessary allocations, N+1 queries
- 🎨 **Code Quality** — Naming, consistency, SOLID violations
- 🏗️ **Architecture Review** — Coupling, cohesion, design patterns

## 🚀 Quick Start

```bash
# Clone
git clone https://github.com/zanabalofficial/agenteye-copilot-extension.git
cd agenteye-copilot-extension

# Install
npm install

# Configure (set your API key)
export OPENROUTER_API_KEY="sk-or-v1-..."
export AI_MODEL="anthropic/claude-sonnet-4"  # or any OpenRouter model

# Run
npm run dev
```

## ⚙️ Configuration

| Variable | Default | Description |
|----------|---------|-------------|
| `OPENROUTER_API_KEY` | — | Your OpenRouter API key (required) |
| `AI_MODEL` | `anthropic/claude-sonnet-4` | Model for code review |
| `AI_PROVIDER` | `openrouter` | AI provider |
| `AI_BASE_URL` | OpenRouter endpoint | Custom API endpoint |
| `PORT` | `3000` | Server port |
| `REVIEW_TYPES` | `bug,security,performance,style,architecture` | Review focus areas |
| `MAX_FILE_SIZE` | `100000` | Max file size in chars |

## 🏗️ Architecture

```
┌──────────────────┐     ┌─────────────────┐     ┌──────────────┐
│  GitHub Copilot  │────▶│  AgentEye Server │────▶│  OpenRouter   │
│  (VS Code / CLI) │     │  (Hono + SSE)    │     │  (Claude/etc) │
└──────────────────┘     └─────────────────┘     └──────────────┘
         │                        │
         ▼                        ▼
   Code Context           Structured Review
   (files, selection)     (severity + fix)
```

## 📦 Setup as GitHub App

1. Go to [GitHub Developer Settings](https://github.com/settings/apps) → New GitHub App
2. Set **Copilot** → App Type: **Agent**
3. Set URL to your deployed server (use ngrok/cloudflared for local testing)
4. Set permissions: Copilot Chat (Read-only), Copilot Editor Context (Read-only)
5. Install the app on your account/org

## 💰 Pricing

| Tier | Price | Features |
|------|-------|----------|
| **Free** | $0 | 50 reviews/month, public repos only |
| **Pro** | $10/month | Unlimited reviews, private repos, priority models |
| **Team** | $50/month | 5 seats, custom review rules, Slack integration |

## 🔒 Security

- All code is processed in-memory, never stored
- GitHub token is only used for request verification
- Reviews stream via SSE, no data retention
- OpenRouter API calls use your own key

## 📄 License

MIT — [LICENSE](LICENSE)

---

Built with ❤️ by [Project Auto-Equity](https://github.com/zanabalofficial)
