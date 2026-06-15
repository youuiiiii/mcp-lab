# Week 11

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

Run:

```bash
npm install
npx expo start
```
