# Neon deployment

Connect Neon to this Vercel project and provide DATABASE_URL, ADMIN_UN, ADMIN_PW,
and ADMIN_SESSION_SECRET (random secret, at least 32 characters) as server-only
variables. Never prefix these with VITE_. Use Node 22 or later.

For local initialization, put these variables in .env.local (ignored by Git), then:

```powershell
cd D:\Dev\scott-hw-online\starship-portfolio
npm.cmd run db:init
npm.cmd run build
npm.cmd start
```

Initialization creates portfolio_documents and imports public/data.json only when
production is absent. Re-running does not overwrite saved content. Redeploy Vercel
after configuring variables. Root directory: starship-portfolio; preset: Vite;
output: dist. For Vite development, also run npm.cmd run dev; /api proxies to port 10000.

Projects and mission logs use stable UUIDs. Each modal Save and Delete persists
immediately; the footer Save also persists the current document. Contact is a
singleton: clear its fields and save to remove published contact information.
About remains editable. Other sections are preserved server-side. Concurrent saves
return 409; reload the page before retrying. No fallback to static data is used when
the database fails. Admin sessions expire after eight hours; logout clears the cookie.
Configure Vercel firewall rate limiting for /api/login before public use.

This uses a versioned JSONB document per portfolio, not separate entity tables.
Autonoma uses the same table with isolated test IDs and signed scope cookies.
See AUTONOMA_RECIPE.md. Live database and Vercel validation requires configured credentials.
