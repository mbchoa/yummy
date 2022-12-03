import { YelpRestaurantSchema } from "../../../models/YelpRestaurantSchema";
import { protectedProcedure, router } from "../trpc";

export const favoriteRestaurant = router({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.favoriteRestaurant.findMany({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
  add: protectedProcedure
    .input(YelpRestaurantSchema)
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.restaurant.create({
        data: {
          ...input,
          favoriteRestaurants: {
            create: {
              userId: ctx.session.user.id,
            },
          },
        },
      });
    }),
});
