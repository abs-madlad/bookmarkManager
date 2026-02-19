# Smart Bookmark App

Next.js App Router + Supabase + Tailwind CSS. Users sign in with Google, add private bookmarks (URL + title), see realtime updates across tabs, and can delete their own bookmarks.

## Features

- Google OAuth-only sign in
- Add and list bookmarks per user
- Row Level Security (private per user)
- Realtime updates across tabs
- Delete own bookmarks

## Development Notes

- 1. OAuth configuration issue
  - Problem: After Google sign-in, the app briefly showed the UI, then reverted to a “Checking session…” screen and displayed a NotFound overlay.
  - Cause: Misconfigured Google OAuth settings and redirect flow. Authorized JavaScript origins must be your app domains (e.g., `http://localhost:3000`, your Vercel domain). Authorized redirect URIs must be the Supabase project callback: `https://<project-ref>.supabase.co/auth/v1/callback`. Supabase `Site URL` should be set to your app domain, and the client uses `redirectTo: window.location.origin`.
  - Resolution: Corrected Google OAuth entries and Supabase `Site URL`; the session now restores properly after sign-in.

- 2. Delete not reflecting immediately
  - Problem: Deleting a bookmark did not update the list until logging out/in; console showed warnings about multiple GoTrueClient instances and errors about double subscriptions.
  - Cause: Creating multiple Supabase clients in the same browser context and subscribing to the same Realtime channel twice in React Strict Mode.
  - Resolution: Implemented a singleton Supabase client, refactored Realtime subscription to create/cleanup per effect, and added optimistic UI updates for add/delete so the list reflects changes immediately.

