import { z } from "zod";
import { YelpRestaurantSchema } from "../../../models/YelpSchemas";
import { protectedProcedure, router } from "../trpc";

export const favoriteRestaurant = router({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.favoriteRestaurant.findMany({
      where: {
        userId: ctx.session.user.id,
      },
      include: {
        restaurant: true,
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
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      return ctx.prisma.favoriteRestaurant.findUniqueOrThrow({
        where: {
          id: input.id,
        },
        include: {
          restaurant: true,
          reviews: true,
        },
      });
    }),
});
