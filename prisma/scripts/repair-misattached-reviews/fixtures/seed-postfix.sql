-- Test fixture: data written after 20261009000000 is applied. alice re-adds "Khao Soi" at
-- thai with the fixed code, so her correctly scoped item already exists before the repair.

INSERT INTO "RestaurantItem" (id, name, "restaurantId", "userId", "createdAt", "updatedAt") VALUES
  ('item_khaosoi_alice', 'Khao Soi', 'thai', 'alice', '2026-10-10', '2026-10-10');

INSERT INTO "RestaurantItemReview"
  (id, "restaurantItemId", "reviewedById", "like", "createdAt", "updatedAt") VALUES
  ('rv_clean_alice_khaosoi', 'item_khaosoi_alice', 'alice', 'LIKE', '2026-10-10', '2026-10-10');
