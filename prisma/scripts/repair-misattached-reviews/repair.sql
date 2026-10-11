-- Repair misattached dish reviews (issue #115). DRY RUN BY DEFAULT: ends with ROLLBACK.
--
-- Usage: psql "$DATABASE_URL" -f prisma/scripts/repair-misattached-reviews/repair.sql
--
-- Only reviews classified "repairable" by classify.sql are touched. Each one is moved to
-- the reviewer's own RestaurantItem with the same name at the same restaurant, creating
-- that item if it doesn't exist yet. Ambiguous reviews are left exactly as they are.
-- Nothing is deleted: the item a review is moved away from stays in place, even if it
-- ends up with no reviews.
--
-- Requires migration 20261009000000_scope_restaurant_item_name_unique; the ON CONFLICT
-- clause below fails without the (name, restaurantId, userId) unique index.

\set ON_ERROR_STOP 1

BEGIN;

-- Block concurrent app writes to these tables (reads still work) until the transaction
-- ends, so the plan below can't go stale while it runs.
LOCK TABLE "RestaurantItem", "RestaurantItemReview" IN SHARE ROW EXCLUSIVE MODE;

\ir classify.sql

CREATE TEMP TABLE repair_plan ON COMMIT DROP AS
SELECT review_id, reviewer_id, item_name, restaurant_id, current_item_id
FROM misattached_review
WHERE status = 'repairable';

CREATE TEMP TABLE counts_before ON COMMIT DROP AS
SELECT
  (SELECT count(*) FROM "RestaurantItem") AS items,
  (SELECT count(*) FROM "RestaurantItemReview") AS reviews,
  (SELECT count(*) FROM "FavoriteRestaurant") AS favorites;

\echo '== Planned moves =='
SELECT * FROM repair_plan ORDER BY reviewer_id, item_name, review_id;

-- Create the correctly scoped items that don't exist yet. ids are app-generated cuids in
-- Prisma; nothing parses them, so a uuid string is fine here.
INSERT INTO "RestaurantItem" (id, name, "restaurantId", "userId", "updatedAt")
SELECT gen_random_uuid()::text, item_name, restaurant_id, reviewer_id, CURRENT_TIMESTAMP
FROM (SELECT DISTINCT item_name, restaurant_id, reviewer_id FROM repair_plan) t
ON CONFLICT (name, "restaurantId", "userId") DO NOTHING;

UPDATE "RestaurantItemReview" r
SET "restaurantItemId" = target.id
FROM repair_plan p
JOIN "RestaurantItem" target
  ON target.name = p.item_name
  AND target."restaurantId" = p.restaurant_id
  AND target."userId" = p.reviewer_id
WHERE r.id = p.review_id
  AND r."restaurantItemId" = p.current_item_id;

-- Abort (and roll back everything) unless every planned review moved correctly and no
-- review or favorite was lost.
DO $$
DECLARE
  not_moved int;
  b counts_before%ROWTYPE;
BEGIN
  SELECT count(*) INTO not_moved
  FROM repair_plan p
  JOIN "RestaurantItemReview" r ON r.id = p.review_id
  JOIN "RestaurantItem" i ON i.id = r."restaurantItemId"
  WHERE i."userId" IS DISTINCT FROM p.reviewer_id
    OR i.name <> p.item_name
    OR i."restaurantId" <> p.restaurant_id;
  IF not_moved > 0 THEN
    RAISE EXCEPTION '% planned review(s) were not moved correctly', not_moved;
  END IF;

  SELECT * INTO b FROM counts_before;
  IF (SELECT count(*) FROM "RestaurantItemReview") <> b.reviews THEN
    RAISE EXCEPTION 'review count changed';
  END IF;
  IF (SELECT count(*) FROM "FavoriteRestaurant") <> b.favorites THEN
    RAISE EXCEPTION 'favorite count changed';
  END IF;
  IF (SELECT count(*) FROM "RestaurantItem") < b.items THEN
    RAISE EXCEPTION 'item count decreased';
  END IF;
END $$;

\echo '== Moved reviews (now) =='
SELECT p.review_id, p.reviewer_id, i.id AS new_item_id, i.name, i."restaurantId",
  i."userId" AS new_owner_id, p.current_item_id AS old_item_id
FROM repair_plan p
JOIN "RestaurantItemReview" r ON r.id = p.review_id
JOIN "RestaurantItem" i ON i.id = r."restaurantItemId"
ORDER BY p.reviewer_id, i.name, p.review_id;

\echo '== Row counts before / after =='
SELECT 'before' AS at, items, reviews, favorites FROM counts_before
UNION ALL
SELECT 'after',
  (SELECT count(*) FROM "RestaurantItem"),
  (SELECT count(*) FROM "RestaurantItemReview"),
  (SELECT count(*) FROM "FavoriteRestaurant");

\echo '== Remaining misattached reviews (left for manual review) =='
SELECT status, reason, count(*) AS reviews
FROM misattached_review
GROUP BY status, reason
ORDER BY status DESC, reason;

-- DRY RUN: everything above is undone here. To apply the repair for real, change the
-- ROLLBACK below to COMMIT (only after reviewing a dry run's output).
ROLLBACK;
