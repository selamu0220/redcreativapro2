import { chromium } from 'playwright';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

async function verifyEmailMode() {
    console.log("🚀 Starting Email Mode Verification (Vanilla Playwright)...");

    const browser = await chromium.launch({ headless: false }); // Headless: false to see it action
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        // 1. Navigate
        console.log("📍 Navigating to AI Writer...");
        await page.goto("http://localhost:3000/escritor-ia");
        await page.waitForTimeout(5000); // Wait for app to load

        // 2. Open Settings
        console.log("⚙️  Opening Settings...");
        // Try to find settings button. Assuming aria-label or icon class.
        // Based on codebase knowledge, SettingsPanel is usually toggled via a button in the header or sidebar.
        // Let's try generic selector or text.
        const settingsButton = page.locator('button[aria-label="Settings"], button:has-text("Settings"), svg.lucide-settings');
        if (await settingsButton.count() > 0) {
            await settingsButton.first().click();
        } else {
            console.log("⚠️ Could not find Settings button by standard selectors. Trying to force open via logic if possible? No, sticking to UI.");
            // Try clicking the tab trigger if it's visible in a dock
            await page.click('text=Configuración');
        }
        await page.waitForTimeout(1000);

        // 3. Enable Email Mode
        console.log("📧 Enabling Email Mode...");
        // Look for switch with id="email-mode" (we saw this in code)
        const emailSwitch = page.locator('#email-mode');
        if (await emailSwitch.count() > 0) {
            // Check if checked
            const isChecked = await emailSwitch.getAttribute('data-state') === 'checked';
            if (!isChecked) {
                await emailSwitch.click();
                console.log("   Toggled ON.");
            } else {
                console.log("   Already ON.");
            }
        } else {
            console.error("❌ Email Mode switch not found!");
            // Maybe inside "Advanced" tab?
            await page.click('text=Avanzado');
            await page.waitForTimeout(500);
            await page.locator('#email-mode').click();
        }

        // 4. Fill Details
        console.log("📝 Filling Email Details...");
        await page.fill('input[placeholder*="recipient"]', 'client@test.com');
        await page.fill('input[placeholder*="subject"]', 'Project Update');

        // 5. Generate
        console.log("🤖 Generating Content...");
        // Close settings
        await page.keyboard.press('Escape');

        // Type text
        await page.click('.ProseMirror'); // Editor class
        await page.keyboard.type('Draft a message about the new feature.');

        // Select text to trigger bubble menu or use global improve
        await page.keyboard.press('Control+A');
        await page.waitForTimeout(500);

        // Click "Mejorar" or similar in bubble menu
        const improveButton = page.locator('button:has-text("Mejorar"), button:has-text("Improve")');
        if (await improveButton.count() > 0) {
            await improveButton.first().click();
        } else {
            console.error("❌ Improve button not found!");
            throw new Error("Improve button missing");
        }

        // 6. Wait for Result
        console.log("⏳ Waiting for generation...");
        await page.waitForTimeout(10000);

        // 7. Verify
        const content = await page.innerText('.ProseMirror');
        console.log("📄 Content:\n", content);

        if (content.includes("Subject:") || content.includes("Project Update")) {
            console.log("✅ SUCCESS: Email format verified.");
        } else {
            console.error("❌ FAILURE: Standard text detected.");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error);
    } finally {
        await browser.close();
    }
}

verifyEmailMode();
