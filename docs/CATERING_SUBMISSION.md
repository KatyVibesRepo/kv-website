# Website catering submission

The public `/catering` page uses a dedicated `CateringRequestForm`, not the email-only `InquiryForm`.
The public browser calls Website `POST /api/catering/request`; the server proxies the validated request to KVRS `POST /api/public/catering-requests` using the shared KVRS resolver and canonical production origin. No database credentials exist in the public Website.

Only an authoritative KVRS success response shows the customer confirmation. A missing/failed KVRS connection shows an error and preserves entered details. Private manager notes and statuses remain in KVRS admin `/admin/catering-requests`.

Deployment dependency: KVRS additive migration and API must be deployed and smoke-tested BEFORE deploying the Website change. Historical `mailto:` requests are not automatically recoverable.
