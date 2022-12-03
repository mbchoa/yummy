import { router } from "../trpc";
import { restaurantRouter } from "./restaurant";

export const appRouter = router({
  restaurant: restaurantRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
