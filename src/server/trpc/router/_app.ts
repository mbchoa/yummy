import { router } from "../trpc";
import { favoriteRestaurant } from "./favoriteRestaurant";
import { restaurantRouter } from "./restaurant";

export const appRouter = router({
  restaurant: restaurantRouter,
  favoriteRestaurant: favoriteRestaurant,
});

// export type definition of API
export type AppRouter = typeof appRouter;
