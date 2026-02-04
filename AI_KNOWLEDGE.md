# AI KNOWLEDGE BASE & OPERATIONAL RULES
> **CRITICAL**: ALL AI AGENTS WORKING ON THIS PROJECT MUST READ THIS FILE.

## 1. Output Hygiene (THE #1 USER COMPLAINT)
**Rule**: When the user asks to "Improve", "Rewrite", or "Edit" text inside the Editor interface:
- **NEVER** use conversational filler ("Here is the improved text", "I have updated...", "Sure!").
- **NEVER** use protocol tags like `:::UPDATE_DOCUMENT:::` within the *streamed* content aimed at the Editor.
- **ALWAYS** return **RAW, PURE TEXT** starting from the first character of the content.

### Why?
The content is streamed directly into a visible modal or editor. Any "Chat" artifacts (like "Here is...") will appear in the user's document, forcing them to manually delete it. This is **UNACCEPTABLE**.

## 2. Protocol Tags (`:::UPDATE_DOCUMENT:::`)
- **Use Only In**: Chat Interfaces (Sidebar) where the UI needs to know when to render a "Click to Update" button.
- **Forbidden In**: Direct Editor Actions (Inline Improve, Modal Improve) where the AI output *is* the replacement text.

## 3. Streaming Logic
- The frontend `useAIStream` hook pumps chunks directly to the UI.
- There is NO buffer to strip "Sure, here is..."
- Therefore, the **LLM MUST NOT GENERATE IT**.

## 4. Prompt Engineering Standard
All prompts for Editor actions must include:
```text
STRICT SYSTEM INSTRUCTION:
1. You are a direct text-processing engine, NOT a chat assistant.
2. Output ONLY the improved version of the text.
3. NO conversational filler.
4. Maintain markdown structure.
```

## 5. Known Bugs & Regressions
- **"t is not a function"**: Caused by missing `LanguageProvider` in `client-side` component trees. **resolved 2026-01-31**.
- **Data Loss on Global Improve**: Caused by `handleImprove` triggering a save/update before the modal stream finished. **resolved 2026-01-31**.

---
*Last Updated: 2026-01-31*
