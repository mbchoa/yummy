import { z } from "zod";
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
    .input(z.object({ restaurantId: z.string() }))
    .mutation(async ({ input, ctx }) => {
      return ctx.prisma.favoriteRestaurant.create({
        data: {
          ...input,
          userId: ctx.session.user.id,
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
          reviews: true,
        },
      });
    }),
});
