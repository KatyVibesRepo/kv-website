# KV Website extracted files

This folder contains a safe first-pass extraction of public Katy Vibes website redesign files from the uploaded `KV ReservationService` project.

Read these first:

1. `KV_Website_Project_Instructions.md`
2. `KV_Website_File_Split_Plan.md`
3. `KV_Project_File_Split_Manifest.csv`

Important: this is a starting split, not a guaranteed standalone runnable app yet. Some copied pages still import reservation-service code or point at local reservation routes. The next step is to refactor the website so ticket/reservation buttons link to KV ReservationService instead of owning transaction logic.

No `.env`, `secrets/`, `node_modules/`, `.next/`, or `prisma/dev.db` files are included.
