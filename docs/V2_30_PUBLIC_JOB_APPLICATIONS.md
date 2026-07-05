# v2.30 — Public Job Applications

The public Katy Vibes website now has a dedicated job application form on `/jobs`.

## Architecture

- KV Website owns the public applicant-facing page and form.
- KV ReservationService owns storage, admin review, statuses, and manager notes.
- Job applications are not stored in the public website project.
- Applicants should not be sent to `/admin`.

## Local development

Run KVRS on port 3001:

```bash
cd "$HOME/Desktop/KV ReservationService"
PORT=3001 npm run dev
```

Run KV Website on port 3000:

```bash
cd "$HOME/Desktop/KV Website"
PORT=3000 npm run dev
```

## Environment variables

KV Website uses either:

```env
KVRS_API_URL=http://localhost:3001
NEXT_PUBLIC_KVRS_URL=http://localhost:3001
```

`KVRS_API_URL` is preferred for the server-side proxy route.

## Request flow

```text
KV Website /jobs
→ POST /api/jobs/apply
→ POST KVRS /api/public/job-applications
→ KVRS stores application with status NEW and source KV_WEBSITE_JOBS_PAGE
→ Manager reviews in KVRS /admin/job-applications
```

## Fallback behavior

If KVRS is offline, the public site does not crash. The form returns a friendly error asking the applicant to try again later.
