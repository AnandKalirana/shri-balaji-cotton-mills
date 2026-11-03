# Supabase setup (database + photo storage)

## 1. Create the project
1. supabase.com > New project. Choose a region close to your customers.
2. Set a strong database password and save it.

## 2. Photo storage
1. Storage > New bucket, name `product-images`, turn on **Public bucket**.
2. Project Settings > API: copy the **Project URL** and the **service_role** key.

## 3. Database connection string
1. Click **Connect** at the top of the dashboard.
2. Copy the **Session pooler** string (port 5432) and replace `[YOUR-PASSWORD]`.
   - If your password has special characters (`@ # / : ?`), URL-encode them (`@` becomes `%40`).
   - Do not use the "Transaction pooler" (port 6543) for `prisma db push`.

## 4. Environment file
Create `.env` in the project root (never commit it):

```
DATABASE_URL="postgresql://postgres.YOUR-PROJECT-REF:YOUR-PASSWORD@aws-0-REGION.pooler.supabase.com:5432/postgres"
JWT_SECRET="a-long-random-string"
SUPABASE_URL="https://YOUR-PROJECT-REF.supabase.co"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
SUPABASE_STORAGE_BUCKET="product-images"
```

## 5. Create the tables and sample data
```
npm install
npx prisma generate
npx prisma db push
npx prisma db seed
```

## 6. Lock down the public API (important)
Open Supabase > SQL Editor, paste the contents of `prisma/supabase-rls.sql` and run it once.
Without this, anyone with your public anon key could read the tables (including customer data).
Run it again whenever you add new tables.

## 7. Check it works
- `npm run dev`, sign in at /account with the admin login, add a product with an uploaded photo.
- Supabase > Table Editor should show the product, and Storage > product-images the photo.

## When you deploy
Add the same environment variables in your host's settings. On serverless hosts (for example Vercel)
use the **Transaction pooler** string (port 6543) for `DATABASE_URL` with `?pgbouncer=true` appended,
and keep the Session/direct string only for running `prisma db push` from your computer.
