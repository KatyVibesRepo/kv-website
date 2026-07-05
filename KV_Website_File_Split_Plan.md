# KV ReservationService → KV Website Split Plan

## Bottom line
The uploaded `KV ReservationService` zip is a mixed Next.js project. It contains:

- Public website redesign pages
- Menu/content/image assets
- Event listing pages
- Reservation and checkout pages
- Admin pages
- API routes
- Stripe code
- Prisma database files
- Google Sheets / SpotHopper / Windows Events Manager sync code
- Build output and dependencies
- Local secrets and `.env` files

Because of that, the safe move is **copy first, refactor second, delete later**.

Do not delete public-looking files from `KV ReservationService` immediately. Some current pages still depend on backend reservation code.

## Files that belong in `KV Website`
These are the best first-pass public website files to move/copy:

### App pages
```text
app/page.tsx
app/about/page.tsx
app/food/page.tsx
app/drinks/page.tsx
app/specials/page.tsx
app/contact/page.tsx
app/parties/page.tsx
app/catering/page.tsx
app/jobs/page.tsx
app/order/page.tsx
app/events/page.tsx
app/layout.tsx
app/styles.css
```

### Website components
```text
components/SiteFooter.tsx
components/ReviewsSection.tsx
components/HomeEventsCarousel.tsx
components/SiteImageCarousel.tsx
components/SiteImageGallery.tsx
components/MenuSection.tsx
components/InquiryForm.tsx
components/EventDatePill.tsx
```

### Website content/helpers
```text
lib/siteContent.ts
lib/siteImages.ts
lib/datetime.ts
```

### Website assets
```text
public/uploads/katyvibes-site/**
```

### Website-related docs/scripts
```text
docs/SITE_IMAGE_IMPORT.md
docs/PUBLIC_LAUNCH_PLAN.md
docs/ROADMAP.md
scripts/ensure-katyvibes-site-images.mjs
scripts/import-katyvibes-site-images.mjs
```

### Basic project config worth copying as a starting point
```text
next.config.mjs
next-env.d.ts
tsconfig.json
.gitignore
.nvmrc
```

## Files that should stay in `KV ReservationService`
These are reservation, transaction, backend, admin, mobile, or sync files:

```text
app/api/**
app/admin/**
app/success/**
components/AdminDeleteReservationButton.tsx
components/AdminEventForm.tsx
components/ReservationAssistant.tsx
lib/assistantEventKnowledge.ts
lib/assistantSettings.ts
lib/constants.ts
lib/db.ts
lib/email.ts
lib/eventsManagerSync.ts
lib/importedReservations.ts
lib/importedTicketSales.ts
lib/inventory.ts
lib/mobileConfirmationCenter.ts
lib/money.ts
lib/prisma.ts
lib/reservationDeletion.ts
lib/reservationIntegrations.ts
lib/slug.ts
lib/stripe.ts
lib/stripeLocalCheckoutFallback.ts
lib/tokens.ts
prisma/schema.prisma
scripts/seed.mjs
scripts/sync-events-manager-api.mjs
scripts/check-mobile-api-db.mjs
scripts/cleanup-spothopper-ticket-sale-reservation-summaries.mjs
scripts/kvrs-local-date-sheet-rebuild.mjs
scripts/kvrs_confirmation_backend_audit.mjs
integrations/events-manager-windows/**
docs/AI_RESERVATION_ASSISTANT.md
docs/AUTOMATION_INTEGRATION.md
docs/DATABASE_NOTES.md
docs/EVENTS_MANAGER_DESKTOP_SYNC.md
docs/KV_RESERVATION_MANAGER_MOBILE_API.md
docs/LOCAL_DEV_STARTUP.md
docs/OPENAI_ASSISTANT_SETUP.md
docs/PRODUCTION_DATABASE_PLAN.md
docs/PRODUCT_SPEC.md
docs/RESERVATION_PIPELINE.md
docs/SPOTHOPPER_RESERVATION_IMPORT.md
docs/SPOTHOPPER_TICKET_SALE_IMPORT.md
docs/WINDOWS_EVENTS_MANAGER_PUSH_SYNC.md
```

## Bridge files that need review before final split
These files look public/customer-facing, but they currently cross into reservation/checkout territory:

```text
app/events/[slug]/page.tsx
app/reserve/page.tsx
components/PublicReservationForm.tsx
components/ReservationOnlyForm.tsx
components/TicketTypeCard.tsx
```

Recommended handling:

- Keep the real checkout/ticket/reservation versions in `KV ReservationService`.
- In `KV Website`, replace these with marketing pages or CTAs that link to KV ReservationService.
- The public website can later show read-only event information from KV ReservationService, but it should not own payment or reservation state.

## Do not move into `KV Website`
Do not copy these into the website project:

```text
.env
.env.local
.env.*.bak*
.env.startup-sync*
secrets/**
prisma/dev.db
node_modules/**
.next/**
.DS_Store
tsconfig.tsbuildinfo
.kvrs-upload-chunks/**
_patch_backups/**
sync_outputs/**
.kvrs_customer_text_cleanup_backup_*/**
.kvrs_specials_customer_copy_fix_backup_*/**
__MACOSX/**
```

These are secrets, local machine data, generated dependencies, build output, backups, or transient sync files.

## Important note about running the new website folder
The extracted public files are a good split starting point, but the new `KV Website` folder may not run immediately without refactoring because:

- `app/page.tsx` currently queries Prisma for upcoming events.
- `app/events/page.tsx` currently queries Prisma for upcoming events.
- Some navigation links still point to local `/reserve` routes.
- The old project mixes website and reservation UX.

The next development step should be to refactor the website to:

1. Remove direct Prisma imports from public pages.
2. Replace local checkout/reservation flows with KV ReservationService links.
3. Add a read-only event-feed integration later if desired.
4. Update lunch/hours content before launch.
