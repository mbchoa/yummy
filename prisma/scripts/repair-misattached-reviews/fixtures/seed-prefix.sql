-- Test fixture: data as the pre-#90 code would have written it. Apply to a throwaway DB
-- migrated up to, but not including, 20261009000000 (RestaurantItem.name globally unique).
--
-- Restaurants are Yelp ids: taco, thai, pho.
--   alice: favorites taco, thai      bob: favorites taco, pho
--   carol: favorites pho (added after her review)      dave: favorites thai

INSERT INTO "User" (id, name) VALUES
  ('alice', 'Alice'), ('bob', 'Bob'), ('carol', 'Carol'), ('dave', 'Dave'), ('erin', 'Erin');

INSERT INTO "FavoriteRestaurant" ("restaurantId", "userId", "createdAt", "updatedAt") VALUES
  ('taco', 'alice', '2023-01-01', '2023-01-01'),
  ('thai', 'alice', '2023-01-01', '2023-01-01'),
  ('taco', 'bob',   '2023-01-01', '2023-01-01'),
  ('pho',  'bob',   '2023-01-01', '2023-01-01'),
  ('thai', 'dave',  '2023-01-01', '2023-01-01'),
  ('pho',  'carol', '2023-06-01', '2023-06-01');

INSERT INTO "RestaurantItem" (id, name, "restaurantId", "userId", "createdAt", "updatedAt") VALUES
  ('item_pastor_alice', 'Al Pastor',  'taco', 'alice', '2023-02-01', '2023-02-01'),
  ('item_padseeew_dave', 'Pad See Ew', 'thai', 'dave', '2023-02-01', '2023-02-01'),
  ('item_photai_bob',   'Pho Tai',    'pho',  'bob',   '2023-02-01', '2023-02-01'),
  ('item_khaosoi_dave', 'Khao Soi',   'thai', 'dave',  '2023-02-01', '2023-02-01');

INSERT INTO "RestaurantItemReview"
  (id, "restaurantItemId", "reviewedById", "like", "createdAt", "updatedAt") VALUES
  -- correct: alice's own review on her own item. Must not be touched.
  ('rv_clean_alice', 'item_pastor_alice', 'alice', 'LIKE', '2023-02-01', '2023-02-01'),
  -- correct: bob's own review on his own item. Must not be touched.
  ('rv_clean_bob', 'item_photai_bob', 'bob', 'LIKE', '2023-02-01', '2023-02-01'),
  -- correct: dave's own reviews.
  ('rv_clean_dave1', 'item_padseeew_dave', 'dave', 'LIKE', '2023-02-01', '2023-02-01'),
  ('rv_clean_dave2', 'item_khaosoi_dave', 'dave', 'LIKE', '2023-02-01', '2023-02-01'),
  -- misattached, repairable: bob added "Al Pastor" at taco (twice) and got alice's item.
  ('rv_bad_bob_pastor1', 'item_pastor_alice', 'bob', 'DISLIKE', '2023-03-01', '2023-03-01'),
  ('rv_bad_bob_pastor2', 'item_pastor_alice', 'bob', 'LIKE', '2023-03-02', '2023-03-02'),
  -- misattached, repairable: alice added "Khao Soi" at thai and got dave's item. After the
  -- fix she re-adds it (seed-postfix.sql), so the target item already exists.
  ('rv_bad_alice_khaosoi', 'item_khaosoi_dave', 'alice', 'LIKE', '2023-03-01', '2023-03-01'),
  -- misattached, ambiguous: bob added "Pad See Ew" somewhere, got dave's thai item, but
  -- bob has no thai favorite.
  ('rv_bad_bob_padseeew', 'item_padseeew_dave', 'bob', 'LIKE', '2023-03-01', '2023-03-01'),
  -- misattached, ambiguous: carol's review predates her pho favorite.
  ('rv_bad_carol_photai', 'item_photai_bob', 'carol', 'LIKE', '2023-03-01', '2023-03-01'),
  -- misattached by erin, whose account was deleted later (reviewedById set to NULL below).
  ('rv_bad_erin', 'item_pastor_alice', 'erin', 'LIKE', '2023-03-01', '2023-03-01');

DELETE FROM "User" WHERE id = 'erin';
