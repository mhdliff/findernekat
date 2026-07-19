# Error Reports — Setup & Usage

## Create the table
1. Open the Supabase SQL editor (or connect to your Postgres instance).
2. Run the SQL in `db/error_reports.sql`.

## Frontend helper
- Use `src/errorReports.js` to insert reports from the app. Example:

```js
import { createErrorReport } from './errorReports';

await createErrorReport({
  title: 'TypeError on click',
  message: 'Cannot read property of undefined',
  url: window.location.href,
  user: { id: 123, email: 'me@example.com' },
});
```

## Optional UI
- `src/ErrorReportForm.jsx` is a tiny form you can mount anywhere in the app to let users submit reports.

## Notes
- `src/supabaseClient.js` already exists and reads `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` from environment variables. Ensure those are set in `.env`.
- The `user` object is stored in `user_info` as JSONB.
