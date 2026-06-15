# Week 13

Supabase setup:

1. Fill `.env` with your Supabase URL and anon key.
2. Create a public Storage bucket named `camera`.
3. Create table `photo` with these columns:
   - `id` int8 primary key
   - `created_at` timestamptz default now()
   - `latitude` text
   - `longitude` text
   - `image_url` text
4. Add an RLS policy that allows insert/select for practice.

Firebase / notification setup:

1. Create a Firebase Android app with package name `com.if670.week13notifications`.
2. Download `google-services.json` and place it in the project root.
3. Replace `extra.eas.projectId` in `app.json` with your EAS project id.
4. Run the EAS setup/build commands from the module.

Week 13 state management:

- `store.ts` creates the Redux store.
- `rootReducer.ts` combines reducers.
- `counter.slice.ts` stores total successful and unsuccessful operations.
- `hooks.ts` contains typed Redux hooks.
- `app/_layout.tsx` wraps the app with Redux Provider.
- `app/index.tsx` updates the counters and displays them inside the notification.

Run:

```bash
npm install
npx expo start --dev-client
```
