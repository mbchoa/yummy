import { YelpRestaurantSchema } from "../../../models/YelpRestaurantSchema";
import { protectedProcedure, router } from "../trpc";

export const restaurantRouter = router({
  add: protectedProcedure
    .input(YelpRestaurantSchema)
    .query(({ input, ctx }) => {
      return ctx.prisma.restaurant.upsert({
        where: {
          id: input.id,
        },
        update: {
          ...input,
        },
        create: {
          ...input,
        },
      });
    }),
});
