import { router } from "../trpc";
import { favoriteRestaurant } from "./favoriteRestaurant";
import { restaurantRouter } from "./restaurant";
import { yelpRouter } from "./yelp";

export const appRouter = router({
  restaurant: restaurantRouter,
  favoriteRestaurant: favoriteRestaurant,
  yelp: yelpRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
