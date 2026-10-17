import { Like, type Prisma } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getEditableListOwnerId, getListAccess } from "./helpers/listAccess";

// what the dashboard rows show: how many dishes are logged and which ones are
// liked. Removing a dish deletes its review but leaves the dish itself, so
// only dishes that still have a review count.
const dashboardInclude = {
  _count: {
    select: {
      restaurantItems: { where: { restaurantItemReview: { some: {} } } },
    },
  },
  restaurantItems: {
    where: { restaurantItemReview: { some: { like: Like.LIKE } } },
    select: { name: true },
    orderBy: { createdAt: "asc" },
  },
} satisfies Prisma.FavoriteRestaurantInclude;

export const favoriteRestaurant = router({
  all: protectedProcedure
    .input(
      z
        .object({
          like: z.enum([Like.LIKE, Like.DISLIKE, Like.UNSELECTED]),
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const { ownerId } = await getListAccess(ctx.prisma, ctx.session.user);
      return ctx.prisma.favoriteRestaurant.findMany({
        where: {
          userId: ownerId,
          like: input?.like ?? undefined,
        },
        include: dashboardInclude,
      });
    }),
  add: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        like: z.enum([Like.LIKE, Like.DISLIKE]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ownerId = await getEditableListOwnerId(
        ctx.prisma,
        ctx.session.user,
      );
      // upsert, so a repeated request (e.g. a double-click) sets the rating
      // instead of failing on the primary key
      return ctx.prisma.favoriteRestaurant.upsert({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: ownerId,
          },
        },
        create: {
          restaurantId: input.id,
          userId: ownerId,
          like: input.like,
        },
        update: {
          like: input.like,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const ownerId = await getEditableListOwnerId(
        ctx.prisma,
        ctx.session.user,
      );
      return ctx.prisma.favoriteRestaurant.delete({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: ownerId,
          },
        },
      });
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { ownerId } = await getListAccess(ctx.prisma, ctx.session.user);
      return ctx.prisma.favoriteRestaurant.findUnique({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: ownerId,
          },
        },
      });
    }),
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        like: z.enum([Like.LIKE, Like.DISLIKE, Like.UNSELECTED]),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ownerId = await getEditableListOwnerId(
        ctx.prisma,
        ctx.session.user,
      );
      return ctx.prisma.favoriteRestaurant.update({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: ownerId,
          },
        },
        data: {
          like: input.like,
        },
      });
    }),
});
