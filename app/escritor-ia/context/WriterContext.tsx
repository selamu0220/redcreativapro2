'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of the context
interface WriterContextType {
    // Editor State
    docId: string | null;
    setDocId: (id: string | null) => void;
    content: string;
    setContent: (content: string) => void;
    docTitle: string;
    setDocTitle: (title: string) => void;

    // AI Settings
    prePrompt: string;
    setPrePrompt: (prompt: string) => void;
    context: string;
    setContext: (context: string) => void;
    expansionLevel: number;
    setExpansionLevel: (level: number) => void;
    speed: number;
    setSpeed: (speed: number) => void;
    emailModeEnabled: boolean;
    setEmailModeEnabled: (enabled: boolean) => void;
    emailRecipient: string;
    setEmailRecipient: (email: string) => void;
    emailSubject: string;
    setEmailSubject: (subject: string) => void;

    // Metrics
    seoScore: number;
    setSeoScore: (score: number) => void;
    humanityScore: number;
    setHumanityScore: (score: number) => void;

    // Status
    isProcessing: boolean;
    setIsProcessing: (isProcessing: boolean) => void;

    // Events
    lastSaved: number;
    notifySaved: () => void;
    sessionId: string;
    startNewSession: () => void;

    // View Settings
    zenMode: boolean;
    setZenMode: (enabled: boolean) => void;

    // Sound Settings
    soundEnabled: boolean;
    setSoundEnabled: (enabled: boolean) => void;

    // Goals
    dailyGoal: number;
    setDailyGoal: (goal: number) => void;

    // Focus Settings
    focusMode: boolean;
    setFocusMode: (enabled: boolean) => void;

    // Animation Events
    updateTrigger: number;
    triggerUpdateAnimation: () => void;
}

const WriterContext = createContext<WriterContextType | undefined>(undefined);

export function WriterProvider({ children }: { children: ReactNode }) {
    // Editor State
    const [content, setContent] = useState('');
    const [docTitle, setDocTitle] = useState('');

    // AI Settings
    const [prePrompt, setPrePrompt] = useState('');
    const [context, setContext] = useState('');
    const [expansionLevel, setExpansionLevel] = useState(0); // 0 = Balanced
    const [speed, setSpeed] = useState(1); // 1 = Balanced

    // Email Mode
    const [emailModeEnabled, setEmailModeEnabled] = useState(false);
    const [emailRecipient, setEmailRecipient] = useState('');
    const [emailSubject, setEmailSubject] = useState('');

    // Metrics
    const [seoScore, setSeoScore] = useState(0);
    const [humanityScore, setHumanityScore] = useState(100);

    // Doc ID for cloud persistence
    const [docId, setDocId] = useState<string | null>(null);

    // Status (Restored)
    const [isProcessing, setIsProcessing] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        const saved = localStorage.getItem('ai-writer-state');
        // ... (existing code)
    }, []);

    // ... (existing code)

    // Event Bus for Save actions
    const [lastSaved, setLastSaved] = useState(0);
    const notifySaved = () => setLastSaved(Date.now());

    // Session ID for forcing editor remounts (Clear actions)
    const [sessionId, setSessionId] = useState(() => Date.now().toString());
    const startNewSession = () => setSessionId(Date.now().toString());

    // View Settings
    const [zenMode, setZenMode] = useState(false);

    // Sound Settings
    const [soundEnabled, setSoundEnabled] = useState(true);

    // Goals
    const [dailyGoal, setDailyGoal] = useState(500);

    // Focus Settings
    const [focusMode, setFocusMode] = useState(false);

    // AI Update Animation Trigger
    const [updateTrigger, setUpdateTrigger] = useState(0);
    const triggerUpdateAnimation = () => setUpdateTrigger(Date.now());

    const value = {
        docId, setDocId, // Export docId
        content, setContent,
        docTitle, setDocTitle,
        prePrompt, setPrePrompt,
        context, setContext,
        expansionLevel, setExpansionLevel,
        speed, setSpeed,
        emailModeEnabled, setEmailModeEnabled,
        emailRecipient, setEmailRecipient,
        emailSubject, setEmailSubject,
        seoScore, setSeoScore,
        humanityScore, setHumanityScore,
        isProcessing, setIsProcessing,
        lastSaved, notifySaved,
        sessionId, startNewSession,
        zenMode, setZenMode,
        soundEnabled, setSoundEnabled,
        dailyGoal, setDailyGoal,
        focusMode, setFocusMode,
        updateTrigger, triggerUpdateAnimation // Export trigger
    };

    return (
        <WriterContext.Provider value={value}>
            {children}
        </WriterContext.Provider>
    );
}

export function useWriter() {
    const context = useContext(WriterContext);
    if (context === undefined) {
        throw new Error('useWriter must be used within a WriterProvider');
    }
    return context;
}
