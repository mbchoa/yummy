import { YelpRestaurantSchema } from "../../../models/YelpRestaurantSchema";
import { protectedProcedure, router } from "../trpc";

export const restaurantRouter = router({
  add: protectedProcedure
    .input(YelpRestaurantSchema)
    .mutation(({ input, ctx }) => {
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
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.restaurant.findMany();
  }),
});
