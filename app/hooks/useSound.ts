"use client";

import { useCallback, useEffect, useRef } from "react";
import { useWriter } from "../escritor-ia/context/WriterContext";

// Tiny 'pop' sound as base64 to avoid missing file errors during dev
const POP_SOUND = "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YU"; // Very short, invalid placeholder but demonstrates intent. 
// Ideally, we load real files.

export function useSound(url?: string, volume: number = 0.5) {
    const { soundEnabled } = useWriter();
    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!url) return;
        try {
            audioRef.current = new Audio(url);
            audioRef.current.volume = volume;
        } catch (e) {
            console.warn("Audio not supported");
        }
    }, [url, volume]);

    const play = useCallback(() => {
        if (!soundEnabled || !audioRef.current) return;

        // Reset time to allow rapid replay
        audioRef.current.currentTime = 0;
        audioRef.current.play().catch(() => { });
    }, [soundEnabled]);

    return [play];
}
