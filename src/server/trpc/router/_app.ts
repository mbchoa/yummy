import { router } from "../trpc";
import { favoriteRestaurant } from "./favoriteRestaurant";
import { yelpRouter } from "./yelp";

export const appRouter = router({
  favoriteRestaurant: favoriteRestaurant,
  yelp: yelpRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
