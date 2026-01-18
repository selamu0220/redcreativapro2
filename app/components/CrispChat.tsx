
"use client";

import { useEffect } from "react";

declare global {
    interface Window {
        $crisp: any;
        CRISP_WEBSITE_ID: string;
    }
}

interface CrispChatProps {
    websiteId?: string; // Optional, defaults to env var or placeholder
}

export const CrispChat = ({ websiteId = "YOUR_CRISP_WEBSITE_ID" }: CrispChatProps) => {
    useEffect(() => {
        // Check if window exists (client-side)
        if (typeof window === "undefined") return;

        // Don't initialize if placeholder or empty
        if (!websiteId || websiteId === "YOUR_CRISP_WEBSITE_ID") {
            console.warn("CrispChat: Website ID not valid. Chat will not load.");
            return;
        }

        // Initialize Crisp
        window.$crisp = [];
        window.CRISP_WEBSITE_ID = websiteId;

        (function () {
            var d = document;
            var s = d.createElement("script");
            s.src = "https://client.crisp.chat/l.js";
            s.async = true;
            d.getElementsByTagName("head")[0].appendChild(s);
        })();

    }, [websiteId]);

    return null;
};
