-- Run in the Supabase SQL Editor ONCE, right before you launch (after the schema is up to date: npx prisma db push).
-- Deletes test ORDERS, test COUPONS and stock history. It keeps your products,
-- categories, store settings, banners and user accounts.
--
-- Delete the sample/test PRODUCTS from Admin > Products (use "Hide"), or run the
-- optional block at the bottom if you want every product gone and will re-add your own.

BEGIN;

DELETE FROM "OrderItem";
DELETE FROM "Order";
DELETE FROM "InventoryLog";
DELETE FROM "Coupon";

COMMIT;

-- OPTIONAL: remove every product (cannot be undone). Uncomment to use.
-- BEGIN;
-- DELETE FROM "Product";
-- COMMIT;
