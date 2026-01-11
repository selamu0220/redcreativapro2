import { Stagehand } from "@browserbasehq/stagehand";
import { z } from "zod";
import dotenv from "dotenv";

dotenv.config();

async function main() {
    const stagehand = new Stagehand({
        env: "LOCAL",
        verbose: 1,
    });

    await stagehand.init();
    console.log("Stagehand initialized.");

    try {
        // Stagehand V3: Access page via context
        // @ts-ignore
        const pages = Array.from(stagehand.context.pagesByTarget.values());
        const page = pages[0];

        if (!page) {
            throw new Error("No page found in Stagehand context.");
        }

        // 1. Navigate
        console.log("Navigating to https://www.google.com ...");
        // @ts-ignore
        await page.goto("https://www.google.com");

        // 2. Act
        console.log("Acting: Accepting cookies or searching...");
        // @ts-ignore
        await stagehand.act("Type 'Stagehand Browserbase' into the search bar and press Enter");

        // 3. Extract
        console.log("Extracting search results...");
        const data = await stagehand.extract(
            "Extract the titles and URLs of the top 3 search results",
            z.object({
                results: z.array(z.object({
                    title: z.string(),
                    url: z.string(),
                })).length(3),
            })
        );

        console.log("Extraction Results:", JSON.stringify(data, null, 2));

    } catch (error) {
        console.error("An error occurred:", error);
    } finally {
        await stagehand.close();
    }
}

main();
