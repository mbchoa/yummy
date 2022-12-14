import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const foodReview = router({
  all: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.restaurantItemReview.findMany({
        where: {
          favoriteRestaurantId: input.restaurantId,
          reviewedById: ctx.session.user.id,
        },
        include: {
          restaurantItem: true,
        },
      });
    }),
  add: protectedProcedure
    .input(
      z.object({
        restaurantId: z.string(),
        like: z
          .enum(["LIKE", "DISLIKE", "UNSELECTED"])
          .optional()
          .default("UNSELECTED"),
        name: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.restaurantItem.create({
        data: {
          name: input.name,
          restaurants: {
            create: [
              {
                like: input.like,
                reviewedBy: {
                  connect: {
                    id: ctx.session.user.id,
                  },
                },
                favoriteRestaurant: {
                  connect: {
                    id: input.restaurantId,
                  },
                },
              },
            ],
          },
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        restaurantId: z.string(),
        like: z.enum(["LIKE", "DISLIKE", "UNSELECTED"]),
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.restaurantItemReview.update({
        where: {
          favoriteRestaurantId_restaurantItemId_reviewedById: {
            favoriteRestaurantId: input.restaurantId,
            restaurantItemId: input.id,
            reviewedById: ctx.session.user.id,
          },
        },
        data: {
          like: input.like,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string(), restaurantId: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.restaurantItemReview.delete({
        where: {
          favoriteRestaurantId_restaurantItemId_reviewedById: {
            favoriteRestaurantId: input.restaurantId,
            restaurantItemId: input.id,
            reviewedById: ctx.session.user.id,
          },
        },
      });
    }),
});
