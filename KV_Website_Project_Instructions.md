# KV Website — Project Instructions

## Project purpose
This ChatGPT project is for finishing the Katy Vibes public website redesign in this local Mac folder:

```bash
/Users/princeali/Desktop/KV Website
```

This project is **not** the reservation/ticketing/backend project. Its job is to build the public-facing Katy Vibes website: pages, copy, layout, SEO, event marketing, menu/lunch content, sports/watch-party content, hookah/patio content, live music/DJ/karaoke content, private-event content, and customer-facing calls to action.

## Relationship to KV ReservationService
KV ReservationService is a separate project. It handles the transaction and operational side:

- Tickets and tables
- Stripe checkout
- Reservation records
- Guest counts
- Table/ticket inventory
- Google Sheets sync
- Admin dashboards
- Staff/mobile APIs
- Webhooks, automation, and integrations

The website should **sell the experience**. KV ReservationService should **complete the transaction and store the reservation**.

Website buttons such as **Buy Tickets**, **Reserve a Table**, **Book Your Spot**, or **Reserve for This Event** should eventually link to KV ReservationService routes or API-backed pages. Do not rebuild Stripe checkout, reservation storage, Google Sheets sync, or table inventory inside the website project unless explicitly instructed.

## Current transition state
The old/current uploaded folder is named `KV ReservationService`, but it contains both public website redesign files and reservation-service code. The split should be done carefully:

1. Copy public website files into `/Users/princeali/Desktop/KV Website`.
2. Leave the original `KV ReservationService` project working until the new website is refactored and verified.
3. Do not delete files from `KV ReservationService` just because they were copied to `KV Website`; some current public pages still depend on Prisma/event/reservation code and must be refactored first.
4. Refactor website pages away from direct Prisma/Stripe/internal reservation imports. The website should link to KV ReservationService or consume a read-only events feed when one is ready.

## Content and brand direction
Katy Vibes is a restaurant, bar, live entertainment venue, sports watch-party venue, patio/weekend hookah destination, and event space in Katy, Texas.

Public website copy should feel:

- Customer-facing
- Polished
- Lively
- Easy to scan
- Confident and professional
- Venue-branded
- Free of developer/prototype/debug wording

Avoid words and labels like `prototype`, `debug`, `test flow`, `sample`, `developer`, `system`, or internal build notes on public pages.

Useful brand language:

- “Live music, food, drinks, and unforgettable nights in Katy.”
- “Reserve your table for the next show.”
- “Catch every big game on the 24-foot screen with surround sound.”
- “Join us for lunch Tuesday through Sunday at 11 AM.”
- “Hookah, DJs, sports, and patio vibes all weekend.”
- “Karaoke, live bands, DJs, watch parties, and more.”
- “Vibe Stronger.”

## Known public-facing business facts
Use these as working facts unless the business provides newer information:

- Phone: `832-437-2807`
- Lunch: open for lunch at **11 AM, Tuesday through Sunday**.
- Do **not** say Katy Vibes is open Monday unless that is verified again.
- Hookah: Friday and Saturday only.
- Do not list a hookah price or hookah charge unless the business confirms a future change.
- Patio hookah messaging should stay simple, customer-facing, and weekend-focused.
- Katy Vibes has karaoke/open-mic programming. Do not say karaoke is not regular unless the business confirms that schedule changed.
- Sports/watch-party pages should highlight the **24-foot projector screen with surround sound**.
- Event/watch-party content often uses **“DURING LUNCH!”** for lunch games and **“WATCH PARTY”** for evening games.
- The project has referenced the address `24757 Katy Freeway, Katy, TX 77494`, but address/hours should still be verified before public launch or hard-coded final deployment.

## Recommended website pages
Build or refine these public website sections:

- Home
- Events
- Reservations / Tickets landing page that links out to KV ReservationService
- Menu
- Lunch Specials
- Drinks
- Specials
- Sports / Watch Parties
- Patio / Hookah
- Karaoke / Open Mic
- Live Music / DJs
- Private Events / Parties
- Catering
- Jobs
- Contact / Visit

## CTA rules
Use strong calls to action, but send transactional work to KV ReservationService:

- Home hero: **Reserve Your Table**
- Event card: **Buy Tickets** or **Reserve for This Event**
- Watch-party page: **Book Your Spot**
- Lunch page: **View Lunch Specials**
- Patio page: **Plan Your Night**
- Private-events page: **Request Event Info**

The destination for ticket/table/payment/reservation CTAs should be KV ReservationService, not local website-only form logic.

## Technical rules for this project
When editing code in this project:

1. Default terminal path:

   ```bash
   cd "$HOME/Desktop/KV Website"
   ```

2. Do not assume files are standalone just because they look public. Some copied public pages currently import reservation-service code such as `@/lib/db`, Prisma, ticket types, or reservation forms.
3. Remove or replace direct imports of these backend/transactional concepts from the website project:
   - Prisma database access
   - Stripe checkout
   - Google Sheets sync
   - admin dashboards
   - mobile manager APIs
   - reservation storage mutation
   - SpotHopper/Windows Events Manager sync
4. Use a future environment variable such as `NEXT_PUBLIC_KVRS_BASE_URL` for links to KV ReservationService.
5. The public website may consume a read-only events feed from KV ReservationService later, but the website should not become the source of truth for events, payments, or reservations.
6. Never copy `.env`, `.env.local`, backup env files, `secrets/`, `prisma/dev.db`, `.next/`, `node_modules/`, `.DS_Store`, `tsconfig.tsbuildinfo`, patch backups, upload chunks, or transient sync outputs into the website project.

## Development style preferences
- Give exact terminal commands.
- Preserve working systems; do not break the live SpotHopper/WordPress site or the working KV ReservationService app during transition.
- Explain what success should look like after each change.
- Prefer small safe patches over risky rewrites.
- Do not invent hours, pricing, schedules, address details, event policies, or availability.
- If something changes often, treat it as dynamic content or tell the user it needs verification before publishing.

## Guiding sentence
**The Katy Vibes website sells the experience; KV ReservationService completes the transaction and stores the reservation.**
