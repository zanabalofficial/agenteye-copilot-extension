# Register AgentEye as a GitHub App

## Step 1: Create the GitHub App

**Click this link (must be logged into GitHub):**

https://github.com/settings/apps/new?manifest=%7B%22name%22%3A%22AgentEye%20Code%20Review%22%2C%22url%22%3A%22https%3A%2F%2Fgithub.com%2Fzanabalofficial%2Fagenteye-copilot-extension%22%2C%22redirect_url%22%3A%22http%3A%2F%2Flocalhost%3A3000%2Fcallback%22%2C%22description%22%3A%22AI%20Code%20Review%20Copilot%20Extension%20%5Cu2014%20catches%20bugs%2C%20security%20issues%2C%20and%20performance%20problems%20before%20they%20reach%20PR%22%2C%22public%22%3Atrue%2C%22default_permissions%22%3A%7B%22copilot_chat%22%3A%22read%22%2C%22copilot_editor_context%22%3A%22read%22%7D%2C%22default_events%22%3A%5B%5D%2C%22callback_urls%22%3A%5B%22http%3A%2F%2Flocalhost%3A3000%2Fcallback%22%5D%2C%22setup_url%22%3A%22https%3A%2F%2Fgithub.com%2Fzanabalofficial%2Fagenteye-copilot-extension%22%2C%22hook_attributes%22%3A%7B%22url%22%3A%22http%3A%2F%2Flocalhost%3A3000%2Fcallback%22%7D%7D

This pre-fills everything. Just scroll down and click **"Create GitHub App"**.

## Step 2: Configure Copilot Extension

After creating the app:
1. Go to the app settings page
2. Find **"Copilot"** section in the left sidebar
3. Set **App Type** to **"Agent"**
4. Set **URL** to your server URL (e.g., `http://localhost:3002` for local testing, or your ngrok URL)

## Step 3: Install the App

1. Go to **"Install App"** in the left sidebar
2. Select your account
3. Click **Install**

## Step 4: Test in VS Code

1. Open VS Code with GitHub Copilot
2. Open a code file
3. Type: `@agenteye review this file for bugs`
4. AgentEye will review your code and show results inline

## Step 5: Go Live (Production)

1. Deploy server to a public URL (Railway, Fly.io, etc.)
2. Update the Copilot URL in app settings
3. Make the app public
4. Submit to GitHub Marketplace

---

Server runs on port 3002 with AI_MODEL=google/gemini-2.5-flash-preview
Start: `cd code-review-copilot && npm run dev`
