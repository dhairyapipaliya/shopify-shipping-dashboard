# Shopify Shipping Dashboard (Custom Dispatch Panel)

This app is the only dispatch, booking, and Shopify fulfillment/tracking sync panel.

## Confirmed architecture
- Shipmozo Shopify app is disabled.
- Shopify remains source of truth for orders + product dimensions + weight.
- This custom app compares only:
  - Delhivery Direct
  - Delhivery via Shipmozo
- Recommendation badge is advisory only. Manual selection is always allowed.
- COD is removed from app logic/UI.

## Quick start
```bash
cp .env.example .env
npm install
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run seed
npm run dev
```

Open `http://localhost:3000/login`.

## Core workflow
1. Sync orders from Shopify (`/orders/sync`).
2. Open an order's **Dispatch Review** page.
3. Review both provider cards with shipping/total/ETA/label/tracking readiness.
4. Manually select provider and book.
5. App stores AWB/tracking/label + AWB source.
6. App pushes fulfillment + tracking to Shopify and stores sync result.

## Key pages
- `/` Dashboard
- `/orders` Shopify orders
- `/orders/:id/dispatch` final dispatch review before booking
- `/shipments` shipment history
- `/shopify-sync-status` Shopify sync states
- `/admin/test-quotes` quote tester

## Notes
- Sandbox/mock first. Real Shopify/provider live sandbox API calls are placeholder methods where marked.
- Strict env validation is enabled on boot.
