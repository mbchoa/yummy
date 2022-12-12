import { router } from "../trpc";
import { favoriteRestaurant } from "./favoriteRestaurant";
import { foodReview } from "./foodReview";
import { yelpRouter } from "./yelp";

export const appRouter = router({
  favoriteRestaurant: favoriteRestaurant,
  foodReview: foodReview,
  yelp: yelpRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
