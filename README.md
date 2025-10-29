ROI Dashboard (Supabase + Vercel)

Deployment:
1. Push this repository to GitHub.
2. In Vercel, import the GitHub repository and deploy.
3. Ensure your Supabase table exists:

   CREATE TABLE IF NOT EXISTS public.roi_records (
     id BIGSERIAL PRIMARY KEY,
     project_name TEXT NOT NULL,
     cost NUMERIC NOT NULL,
     revenue NUMERIC NOT NULL,
     created_at TIMESTAMPTZ DEFAULT now()
   );

Notes:
- For production, don't hardcode keys in source. Use Vercel Environment Variables (SUPABASE_URL, SUPABASE_KEY).
- Frontend calls /api/records which maps to the serverless function.
