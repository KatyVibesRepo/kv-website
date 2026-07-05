#!/bin/bash
set -euo pipefail

SRC="$HOME/Desktop/KV ReservationService"
DEST="$HOME/Desktop/KV Website"

if [ ! -d "$SRC" ]; then
  echo "Could not find source folder: $SRC"
  exit 1
fi

mkdir -p "$DEST"

copy_file() {
  local rel="$1"
  if [ -f "$SRC/$rel" ]; then
    mkdir -p "$DEST/$(dirname "$rel")"
    cp -p "$SRC/$rel" "$DEST/$rel"
    echo "Copied $rel"
  else
    echo "Skipped missing file: $rel"
  fi
}

copy_dir() {
  local rel="$1"
  if [ -d "$SRC/$rel" ]; then
    mkdir -p "$DEST/$rel"
    rsync -a --exclude='.DS_Store' "$SRC/$rel/" "$DEST/$rel/"
    echo "Copied folder $rel"
  else
    echo "Skipped missing folder: $rel"
  fi
}

# Public website pages
copy_file "app/page.tsx"
copy_file "app/about/page.tsx"
copy_file "app/food/page.tsx"
copy_file "app/drinks/page.tsx"
copy_file "app/specials/page.tsx"
copy_file "app/contact/page.tsx"
copy_file "app/parties/page.tsx"
copy_file "app/catering/page.tsx"
copy_file "app/jobs/page.tsx"
copy_file "app/order/page.tsx"
copy_file "app/events/page.tsx"
copy_file "app/layout.tsx"
copy_file "app/styles.css"

# Public website components
copy_file "components/SiteFooter.tsx"
copy_file "components/ReviewsSection.tsx"
copy_file "components/HomeEventsCarousel.tsx"
copy_file "components/SiteImageCarousel.tsx"
copy_file "components/SiteImageGallery.tsx"
copy_file "components/MenuSection.tsx"
copy_file "components/InquiryForm.tsx"
copy_file "components/EventDatePill.tsx"

# Website content/helpers
copy_file "lib/siteContent.ts"
copy_file "lib/siteImages.ts"
copy_file "lib/datetime.ts"

# Website assets
copy_dir "public/uploads/katyvibes-site"

# Website-related docs/scripts
copy_file "docs/SITE_IMAGE_IMPORT.md"
copy_file "docs/PUBLIC_LAUNCH_PLAN.md"
copy_file "docs/ROADMAP.md"
copy_file "scripts/ensure-katyvibes-site-images.mjs"
copy_file "scripts/import-katyvibes-site-images.mjs"

# Basic Next config files
copy_file "next.config.mjs"
copy_file "next-env.d.ts"
copy_file "tsconfig.json"
copy_file ".gitignore"
copy_file ".nvmrc"

cat > "$DEST/README_KV_WEBSITE_SPLIT.md" <<'README'
# KV Website split notes

This folder was created by copying public website redesign files out of `KV ReservationService`.

Important:

- This is a safe first-pass copy, not a destructive move.
- Do not copy `.env`, `secrets/`, `prisma/dev.db`, `node_modules/`, or `.next/` into this folder.
- Some copied pages may still import reservation-service code such as Prisma or local reservation routes. Refactor those before treating this as a standalone website app.
- The website should link to KV ReservationService for tickets, tables, checkout, and reservation storage.

Recommended next refactor:

1. Remove direct Prisma imports from `app/page.tsx` and `app/events/page.tsx`.
2. Replace `/reserve` checkout/reservation links with KV ReservationService URLs.
3. Add `NEXT_PUBLIC_KVRS_BASE_URL` for reservation/ticket links.
4. Update lunch/hours content before publishing.
README

cat > "$DEST/.gitignore" <<'GITIGNORE'
node_modules
.next
.env
.env.*
!.env.example
.DS_Store
tsconfig.tsbuildinfo
prisma/dev.db
secrets/
GITIGNORE

echo ""
echo "Done. Website candidate files copied to: $DEST"
echo "Next step: refactor Prisma/reservation imports before running this as a standalone website."
