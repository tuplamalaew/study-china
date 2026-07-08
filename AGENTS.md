<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

<!-- BEGIN:studychina-project-rules -->
# StudyChina Project Development Rules

## 1. Electron & Next.js Static Export
- **No SSR/Server Code**: Next.js is configured for static export (`output: "export"`). You MUST use `'use client'` at the top of all React component files in `src/app` and `src/components`.
- **No API Routes**: Do not create or use folder paths under `app/api/` or use Next.js Server Actions.
- **Data Persistence**: Use the helper methods in [storage.ts](file:///d:/Project/StudyChina/src/lib/storage.ts) which wrapper `localStorage` instead of direct access.

## 2. Audio Management (Avoid Stutter & Memory Leaks)
- **AudioContext Reuse**: Never create new `AudioContext` instances dynamically. Always use the central Audio System defined in [audio.ts](file:///d:/Project/StudyChina/src/lib/audio.ts).
- **SFX Triggering**: Trigger game sound effects via `playSound` or imports from the UI/UX audio helper to ensure consistency.

## 3. Modularity & State Rules
- **Component Size Limit**: Keep React components modular and focused. No component file should exceed 200 lines.
- **Centralized Types**: All types and interfaces MUST reside in [types.ts](file:///d:/Project/StudyChina/src/data/types.ts). Export component props explicitly as `{ComponentName}Props`.
- **State Management**: Use Zustand ([gameStore.ts](file:///d:/Project/StudyChina/src/stores/gameStore.ts)) or React `useReducer` for complex game/app flows. Do not write deeply nested `useState` hooks in high-level components.
- **Immutable Static Data**: All Pinyin sets, ranks, and constant variables must be imported from `src/data/` (e.g. [pinyin.ts](file:///d:/Project/StudyChina/src/data/pinyin.ts), [ranks.ts](file:///d:/Project/StudyChina/src/data/ranks.ts), [focused-sets.ts](file:///d:/Project/StudyChina/src/data/focused-sets.ts)). Do not hardcode them.

## 4. UI Design System (Wuxia & Dark Glassmorphism)
- **Palette**: Slate-900 backgrounds, Slate-800 borders, Emerald/Cyan (`from-emerald-400 to-cyan-500`) for success, Rose/Crimson for mistakes, and Gold/Yellow gradient for flawless achievements.
- **Glassmorphism**: Use `bg-slate-900/50 backdrop-blur-md border border-slate-700/50` for premium container layouts.
- **Sizing**: Target Electron desktop environment resolutions (1024x768 to 1280x800). Ensure clean layout sizing without standard browser scrolling unless inside dedicated container panels.
## 5. Automated Validation & QA
- **Pre-flight Checks**: Before telling the user a task is completed, you MUST run `npm run lint` or check for typescript errors using terminal tools if code changes were made.
- **Self-Correction**: If the linter or TypeScript compiler throws errors, you must fix them autonomously before reporting back to the user.
<!-- END:studychina-project-rules -->

