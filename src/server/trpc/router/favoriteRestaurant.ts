import { Like, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
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

// the states a saved restaurant can be in
const savedLikeSchema = z.enum([Like.LIKE, Like.DISLIKE, Like.WANT_TO_TRY]);

// restaurants on the list; removed ones are kept, hidden, so saving them
// again brings back their dishes and note
const onList = { removedAt: null };

export const favoriteRestaurant = router({
  all: protectedProcedure
    .input(
      z
        .object({
          like: savedLikeSchema,
        })
        .optional(),
    )
    .query(async ({ input, ctx }) => {
      const { ownerId } = await getListAccess(ctx.prisma, ctx.session.user);
      return ctx.prisma.favoriteRestaurant.findMany({
        where: {
          userId: ownerId,
          like: input?.like ?? undefined,
          ...onList,
        },
        include: dashboardInclude,
      });
    }),
  // how each of these restaurants is saved, if at all, e.g. for search results
  statuses: protectedProcedure
    .input(z.object({ ids: z.array(z.string()).max(50) }))
    .query(async ({ input, ctx }) => {
      const { ownerId } = await getListAccess(ctx.prisma, ctx.session.user);
      return ctx.prisma.favoriteRestaurant.findMany({
        where: {
          userId: ownerId,
          restaurantId: { in: input.ids },
          ...onList,
        },
        select: {
          restaurantId: true,
          like: true,
        },
      });
    }),
  // saves the restaurant in this state, or moves it there; saving a removed
  // restaurant restores it
  add: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        like: savedLikeSchema,
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
          removedAt: null,
        },
      });
    }),
  // hides the restaurant from the list, keeping its dishes and note
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
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
          removedAt: new Date(),
        },
      });
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      const { ownerId } = await getListAccess(ctx.prisma, ctx.session.user);
      return ctx.prisma.favoriteRestaurant.findFirst({
        where: {
          restaurantId: input.id,
          userId: ownerId,
          ...onList,
        },
      });
    }),
  setNote: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        // a blank note is stored as null
        note: z
          .string()
          .trim()
          .max(500)
          .transform((note) => (note.length > 0 ? note : null)),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const ownerId = await getEditableListOwnerId(
        ctx.prisma,
        ctx.session.user,
      );
      const { count } = await ctx.prisma.favoriteRestaurant.updateMany({
        where: {
          restaurantId: input.id,
          userId: ownerId,
          ...onList,
        },
        data: {
          note: input.note,
        },
      });

      if (count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Save this restaurant before adding a note",
        });
      }
    }),
});
