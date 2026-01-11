# Stagehand Demo

To run this demo:

1.  Copy `.env.example` to `.env` and fill in your API keys (OPENAI_API_KEY is required).
2.  Install dependencies (if not already done):
    ```bash
    npm install
    ```
3.  Run the script:
    ```bash
    npx tsx index.ts
    ```

## Notes
- Ensure you have a valid LLM API key.
- By default, this runs locally (`env: "LOCAL"`) using your local Chrome/Chromium installation via Playwright.
- To use Browserbase cloud, change `env` to `"BROWSERBASE"` in `index.ts` and provide `BROWSERBASE_API_KEY` and `BROWSERBASE_PROJECT_ID`.
