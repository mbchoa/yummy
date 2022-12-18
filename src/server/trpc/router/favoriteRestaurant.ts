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
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.favoriteRestaurant.create({
        data: {
          restaurantId: input.id,
          userId: ctx.session.user.id,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.favoriteRestaurant.delete({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: ctx.session.user.id,
          },
        },
      });
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input, ctx }) => {
      return ctx.prisma.favoriteRestaurant.findUniqueOrThrow({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: ctx.session.user.id,
          },
        },
      });
    }),
});
