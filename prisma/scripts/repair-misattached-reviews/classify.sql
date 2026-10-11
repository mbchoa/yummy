-- Shared classification for issue #115. Included by report.sql and repair.sql via \ir.
--
-- Creates a session-local TEMP VIEW only; it does not modify any table.
--
-- A review is "misattached" when its reviewer is not the owner of the RestaurantItem it
-- points to. Before the #90 fix, RestaurantItem.name was globally unique and
-- foodReview.add used connectOrCreate keyed on the name alone, so adding a dish whose
-- name already existed anywhere attached the new review to that existing item. Reviews
-- are always created with reviewedById = the list owner, so the mismatch is reliable.
--
-- Classification (status / reason):
--   repairable / reviewer_has_restaurant
--     The reviewer has their own FavoriteRestaurant at the misattached item's restaurant,
--     created at or before the review. The repair moves the review to the reviewer's
--     item with the same name at that restaurant. This keeps the review on the
--     restaurant page where the reviewer already sees it today (foodReview.all filters
--     by reviewedById and the item's restaurantId), so it never changes what they see.
--   ambiguous / reviewer_lacks_restaurant
--     The reviewer has no FavoriteRestaurant at the item's restaurant, so the dish was
--     added at some other restaurant and we can't tell which one. Favorites can be
--     removed, so even a single remaining candidate isn't proof. candidate_restaurant_ids
--     lists the reviewer's favorites that existed when the review was created.
--   ambiguous / favorite_added_after_review
--     The reviewer has a favorite at that restaurant, but it was created after the
--     review, so the review was probably added elsewhere (or the favorite was removed
--     and re-added). Needs a human decision.
--   ambiguous / reviewer_deleted
--     reviewedById is NULL (the reviewer's account was deleted). No owner to move to.

CREATE TEMP VIEW misattached_review AS
SELECT
  r.id AS review_id,
  r."reviewedById" AS reviewer_id,
  r."createdAt" AS review_created_at,
  i.id AS current_item_id,
  i.name AS item_name,
  i."restaurantId" AS restaurant_id,
  i."userId" AS current_owner_id,
  fav."createdAt" AS reviewer_favorite_created_at,
  CASE
    WHEN r."reviewedById" IS NULL THEN 'ambiguous'
    WHEN fav."userId" IS NULL THEN 'ambiguous'
    WHEN fav."createdAt" > r."createdAt" THEN 'ambiguous'
    ELSE 'repairable'
  END AS status,
  CASE
    WHEN r."reviewedById" IS NULL THEN 'reviewer_deleted'
    WHEN fav."userId" IS NULL THEN 'reviewer_lacks_restaurant'
    WHEN fav."createdAt" > r."createdAt" THEN 'favorite_added_after_review'
    ELSE 'reviewer_has_restaurant'
  END AS reason,
  (
    SELECT array_agg(c."restaurantId" ORDER BY c."restaurantId")
    FROM "FavoriteRestaurant" c
    WHERE c."userId" = r."reviewedById"
      AND c."createdAt" <= r."createdAt"
  ) AS candidate_restaurant_ids
FROM "RestaurantItemReview" r
JOIN "RestaurantItem" i ON i.id = r."restaurantItemId"
LEFT JOIN "FavoriteRestaurant" fav
  ON fav."restaurantId" = i."restaurantId"
  AND fav."userId" = r."reviewedById"
WHERE r."reviewedById" IS DISTINCT FROM i."userId";
