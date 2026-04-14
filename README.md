# Shopify Shipping Dashboard (Sandbox/Test Ready)

A production-ready starter dashboard for Shopify shipping ops with:
- Shopify order sync (mock mode + real sandbox placeholders)
- Clean admin panel for non-technical users
- Provider-based shipping architecture
- Delhivery Direct + Shipmozo (Delhivery-only lane) modules
- Cheapest-only courier comparison engine
- Manual courier override and shipment booking
- AWB generation, label link, tracking link flow
- PostgreSQL + Prisma
- Secure admin login using bcrypt + server session

## 1) Quick start

```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run dev
```

Open: `http://localhost:3000/login`

Use credentials from `.env`:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`

## 2) Environment variables

See `.env.example` for all placeholders. **Do not use live production credentials.**

Strictly validated vars include Shopify, Delhivery, and Shipmozo credentials + base URLs.
If any required value is missing or malformed, app boot fails with a clear field-level message.

Mock/live switches:
- `SHOPIFY_USE_MOCK_DATA`
- `DELHIVERY_USE_MOCK`
- `SHIPMOZO_USE_MOCK`

When any of the above flags are set to `false`, sandbox-live credential checks run and return explicit errors if keys/URLs are missing.

## 3) Current comparison logic (business rule)

This build intentionally compares only:
1. **Delhivery Direct**
2. **Delhivery via Shipmozo**

Recommendation is always the **cheapest total shipping cost**.

The comparison screen shows:
- Delhivery Direct price
- Shipmozo Delhivery price
- Cheapest option
- Savings amount
- Manual override booking button for either option

## 4) Sandbox API integration readiness

The provider layer now has explicit request/response interfaces for:
- serviceability
- quote/rate response
- shipment booking
- AWB generation
- label download
- tracking

Files:
- `src/services/providers/apiInterfaces.ts`
- `src/services/providers/delhiveryDirect.ts`
- `src/services/providers/shipmozo.ts`

Both providers include:
- mock-mode implementation
- live-sandbox placeholder calls
- retry wrapper + failed-call logging

## 5) Admin test page

Route: `GET/POST /admin/test-quotes`

Enter:
- destination pincode
- weight
- dimensions
- COD/prepaid
- order value

See:
- Delhivery Direct quote
- Shipmozo Delhivery quote
- cheapest option
- savings amount

## 6) Webhook placeholders

Added sandbox placeholder endpoints:
- `POST /webhooks/shopify`
- `POST /webhooks/delhivery`
- `POST /webhooks/shipmozo`

These currently log payload metadata and return `202 Accepted` for easy future expansion.

## 7) Core workflow

1. Login as admin.
2. Go to **Orders** and click **Sync Shopify Orders**.
3. Click **Compare Cheapest Delhivery Option** for an order.
4. Review cheapest recommendation and savings.
5. Optionally override manually and click **Select & Book**.
6. Open **Shipments** to view AWB, label download, and tracking links.

## 8) Production hardening checklist

- Replace placeholder live calls with real sandbox API requests.
- Add provider webhook signature verification.
- Add CSRF protection (e.g., `csurf`) for form routes.
- Add audit logs and role-based access controls.
- Move label storage to object storage (e.g., S3) if generating real labels.
- Add background jobs for periodic order sync + tracking updates.

## 9) Testing

```bash
npm test
```

Includes quote engine unit tests.
