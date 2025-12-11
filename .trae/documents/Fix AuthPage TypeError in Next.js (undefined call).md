## Diagnosis
- The error "Cannot read properties of undefined (reading 'call')" occurs when `await signIn(email, password)` or `await signUp(email, password)` is invoked but the referenced value is `undefined`, which compiles to `undefined.call(...)` in the dev JSX runtime.
- In `app/auth/page.tsx:64` and `app/auth/page.tsx:73`, `signIn`/`signUp` come from `useAuth()` (`app/hooks/useAuth.ts:13`). If `useAuth()` returns an object with missing methods, the submit handler triggers this runtime crash.
- `useAuth()` attempts `useMinimalAuth()` and falls back to `useWorkingAuthContext()` (`app/hooks/useAuth.ts:13-42`). If the active provider is not MinimalProviders, the first call throws and is silently caught, then it uses `useWorkingAuthContext()`. Any mismatch or provider absence can leave `signIn`/`signUp` undefined.
- Root layout wraps children with `Providers` which uses `WorkingAuthProvider` (`app/layout.tsx:20`, `app/components/Providers.tsx:13`). `WorkingAuthProvider` exposes `signIn`/`signUp` (`app/components/WorkingAuthProvider.tsx:128-204`). The crash indicates `useAuth()` did not return callable methods under some render conditions.

## Plan
1. Make `useAuth()` robust and provider-agnostic.
   - Prefer `useWorkingAuthContext()` by default since RootLayout uses `WorkingAuthProvider`.
   - Keep MinimalProviders fallback, but only use it if it returns a context with callable `signIn`/`signUp`.
   - Guarantee `signIn`, `signUp`, `logout` are always functions; when a provider is missing, return safe stubs that reject with a descriptive error so the UI shows an error instead of crashing.

2. Add guard in `AuthPageContent` submit handler.
   - Before invoking, check `typeof signIn === 'function'` (or `signUp` for register). If not, set local error state and stop.
   - This prevents runtime TypeError during user interaction.

3. Keep loading/hydration behavior unchanged.
   - Maintain existing `isHydrated` and `loading` gating in `app/auth/page.tsx` to avoid premature calls.

4. Verify locally.
   - Navigate to `/auth`, submit both login and signup flows.
   - Confirm: no crash, error message is displayed if provider is unavailable, and successful flows still work.

## Files To Update
- `app/hooks/useAuth.ts`: Implement safe selection and guaranteed callables.
- `app/auth/page.tsx`: Add defensive checks before invoking auth methods.

## Expected Outcome
- Eliminates the runtime TypeError by ensuring the page never calls `undefined` as a function.
- Preserves existing provider functionality while providing clear errors when misconfigured.

Proceed to apply these changes and test the `/auth` page end-to-end.