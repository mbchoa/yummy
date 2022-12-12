import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const foodReview = router({
  all: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.foodReview.findMany({
        where: {
          restaurantId: input.restaurantId,
          userId: ctx.session.user.id,
        },
      });
    }),
  add: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        like: z.enum(["LIKE", "DISLIKE", "UNSELECTED"]),
        name: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.foodReview.create({
        data: {
          restaurantId: input.restaurantId,
          userId: ctx.session.user.id,
          name: input.name,
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        like: z.enum(["LIKE", "DISLIKE", "UNSELECTED"]),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.foodReview.update({
        where: {
          id: input.id,
        },
        data: {
          like: input.like,
        },
      });
    }),
});
