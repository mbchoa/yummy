import { router } from "../trpc";
import { collaborator } from "./collaborator";
import { favoriteRestaurant } from "./favoriteRestaurant";
import { foodReview } from "./foodReview";
import { user } from "./user";
import { yelp } from "./yelp";

export const appRouter = router({
  collaborator,
  favoriteRestaurant,
  foodReview,
  user,
  yelp,
});

// export type definition of API
export type AppRouter = typeof appRouter;
