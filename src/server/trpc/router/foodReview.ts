import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const foodReview = router({
  all: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(({ ctx, input }) => {
      return ctx.prisma.restaurantItemReview.findMany({
        where: {
          reviewedById: ctx.session.user.id,
          restaurantItem: {
            restaurantId: input.restaurantId,
          },
        },
        include: {
          restaurantItem: true,
        },
        orderBy: {
          createdAt: "desc",
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
      return ctx.prisma.restaurantItemReview.create({
        data: {
          like: input.like,
          restaurantItem: {
            connectOrCreate: {
              where: {
                name: input.name,
              },
              create: {
                name: input.name,
                restaurant: {
                  connect: {
                    restaurantId_userId: {
                      restaurantId: input.restaurantId,
                      userId: ctx.session.user.id,
                    },
                  },
                },
              },
            },
          },
          reviewedBy: {
            connect: {
              id: ctx.session.user.id,
            },
          },
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
      return ctx.prisma.restaurantItemReview.update({
        where: {
          id: input.id,
        },
        data: {
          like: input.like,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(({ input, ctx }) => {
      return ctx.prisma.restaurantItemReview.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
