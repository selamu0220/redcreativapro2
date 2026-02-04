import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import dotenv from "dotenv";
import path from "path";

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function verifyEmailMode() {
    console.log("🚀 Starting Email Mode Verification with Stagehand...");

    // Config Stagehand with OpenRouter (via OpenAI compatible interface)
    const stagehand = new Stagehand({
        env: "LOCAL",
        verbose: 1,
        debugDom: true,
        modelName: "openai/gpt-4o-mini", // OpenRouter model alias
        modelClientOptions: {
            apiKey: process.env.OPEN_ROUTER_API_KEY,
            baseURL: "https://openrouter.ai/api/v1",
        },
    });

    await stagehand.init();
    const page = stagehand.page;

    try {
        // 1. Navigate to AI Writer
        console.log("📍 Navigating to AI Writer...");
        await page.goto("http://localhost:3000/escritor-ia");

        // Wait for hydration
        await page.waitForTimeout(3000);

        // 2. Open Settings
        console.log("⚙️  Opening Settings...");
        await page.act("Click on the Settings icon (gear icon) in the right sidebar or header");
        await page.waitForTimeout(1000);

        // 3. Enable Email Mode
        console.log("📧 Enabling Email Mode...");
        await page.act("Click on the 'Advanced' tab in the settings panel");
        await page.act("Toggle the 'Email Mode' switch to ON");

        // 4. Fill Details
        console.log("📝 Filling Email Details...");
        await page.act("Type 'client@test.com' into the Recipient field");
        await page.act("Type 'Project Update' into the Subject field");

        // 5. Generate Content
        console.log("🤖 Generating Content...");
        // Close settings first if it's a sheet/modal
        await page.act("Close the settings panel by clicking outside or on the close button");

        // Type in editor
        await page.act("Click inside the main text editor area");
        await page.keyboard.type("Draft a message about the new feature being ready.");

        // Click Improve (which triggers AI)
        await page.act("Click the 'Improve' magic wand button or 'Publicar' button if improved is not visible, wait, looking for 'Improve' specifically");
        // Note: The UI might have specific buttons. Let's look for the main action button.
        // In EditorPanelV3, there is a "WriterContext" but the button might be in the toolbar or bubble menu.
        // Let's assume we want to trigger the generation.
        // Actually, in the code, 'handleImprove' is triggered by... let's check UI.
        // There is no explicit "Improve" button in the generic toolbar in EditorPanelV3, it's usually in a BubbleMenu or the "Assistant" panel.
        // Wait, the user request says "el modo correo de ajustes, crea 30 tareas nuevo plan para hacerque funcion"
        // The previous implementation added log to `handleImprove`.
        // Let's try to use the "Assistant" panel to trigger it if possible, or selecting text and using Bubble Menu.

        // Let's select the text first
        await page.act("Select all text in the editor");
        await page.act("Click 'Fix' or 'Improve' in the floating bubble menu");

        // 6. Wait for Result
        console.log("⏳ Waiting for generation...");
        await page.waitForTimeout(8000); // Wait for streaming to finish

        // 7. Extract and Verify
        console.log("🔍 Verifying Output...");
        const content = await page.extract({
            instruction: "Extract the full text content from the editor",
            schema: z.object({
                text: z.string(),
            }),
        });

        console.log("📄 Generated Content:\n", content.text);

        if (content.text.includes("Subject:") || content.text.includes("Project Update")) {
            console.log("✅ SUCCESS: Email format detected!");
        } else {
            console.error("❌ FAILURE: Email format NOT detected.");
            process.exit(1);
        }

    } catch (error) {
        console.error("❌ Error during verification:", error);
        process.exit(1);
    } finally {
        await stagehand.close();
    }
}

verifyEmailMode();
