-- Read-only report of misattached dish reviews (issue #115).
--
-- Usage: psql "$DATABASE_URL" -f prisma/scripts/repair-misattached-reviews/report.sql
--
-- The transaction is switched to READ ONLY right after the temp view is created, and is
-- rolled back at the end, so this script cannot write to any table.

\set ON_ERROR_STOP 1

BEGIN;

\ir classify.sql

SET TRANSACTION READ ONLY;

\echo '== Totals =='
SELECT
  (SELECT count(*) FROM "RestaurantItemReview") AS total_reviews,
  (SELECT count(*) FROM misattached_review WHERE reviewer_id IS NOT NULL)
    AS misattached_reviews,
  (SELECT count(*) FROM misattached_review WHERE reviewer_id IS NULL)
    AS reviewer_deleted_reviews;

\echo '== By classification =='
SELECT status, reason, count(*) AS reviews
FROM misattached_review
GROUP BY status, reason
ORDER BY status DESC, reason;

\echo '== Detail =='
SELECT
  status,
  reason,
  review_id,
  reviewer_id,
  item_name,
  restaurant_id,
  current_owner_id,
  current_item_id,
  review_created_at,
  reviewer_favorite_created_at,
  candidate_restaurant_ids
FROM misattached_review
ORDER BY status DESC, reason, reviewer_id, item_name, review_created_at;

\echo 'Note: reviews attached to the right user but the wrong restaurant cannot be detected.'

ROLLBACK;
