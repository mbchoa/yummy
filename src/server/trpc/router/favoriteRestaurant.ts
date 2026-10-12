import { Like, type Prisma } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

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
      if (ctx.session.user.settings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      const { selectedUserId } = ctx.session.user.settings;
      // check if selected user is the same as the user
      if (selectedUserId === ctx.session.user.id) {
        return ctx.prisma.favoriteRestaurant.findMany({
          where: {
            userId: ctx.session.user.id,
            like: input?.like ?? undefined,
          },
          include: dashboardInclude,
        });
      }

      // check if use has access to selected user in user settings
      const collaborator = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: ctx.session.user.id,
            ownerId: selectedUserId,
          },
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "User does not have access to selected user's favorites list",
        });
      }

      return ctx.prisma.favoriteRestaurant.findMany({
        where: {
          userId: selectedUserId,
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
      if (ctx.session.user.settings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      const { selectedUserId } = ctx.session.user.settings;

      // upsert, so a repeated request (e.g. a double-click) sets the rating
      // instead of failing on the primary key
      // check if selected user is the same as the user
      if (selectedUserId === ctx.session.user.id) {
        return ctx.prisma.favoriteRestaurant.upsert({
          where: {
            restaurantId_userId: {
              restaurantId: input.id,
              userId: ctx.session.user.id,
            },
          },
          create: {
            restaurantId: input.id,
            userId: ctx.session.user.id,
            like: input.like,
          },
          update: {
            like: input.like,
          },
        });
      }

      // check if use has access to selected user in user settings
      const collaborator = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: ctx.session.user.id,
            ownerId: selectedUserId,
          },
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "User does not have access to selected user's favorites list",
        });
      }

      return ctx.prisma.favoriteRestaurant.upsert({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: selectedUserId,
          },
        },
        create: {
          restaurantId: input.id,
          userId: selectedUserId,
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
      if (ctx.session.user.settings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      const { selectedUserId } = ctx.session.user.settings;
      if (selectedUserId === ctx.session.user.id) {
        return ctx.prisma.favoriteRestaurant.delete({
          where: {
            restaurantId_userId: {
              restaurantId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
      }

      // check if use has access to selected user in user settings
      const collaborator = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: ctx.session.user.id,
            ownerId: selectedUserId,
          },
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "User does not have access to selected user's favorites list",
        });
      }

      return ctx.prisma.favoriteRestaurant.delete({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: selectedUserId,
          },
        },
      });
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input, ctx }) => {
      if (ctx.session.user.settings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      const { selectedUserId } = ctx.session.user.settings;
      if (selectedUserId === ctx.session.user.id) {
        return ctx.prisma.favoriteRestaurant.findUnique({
          where: {
            restaurantId_userId: {
              restaurantId: input.id,
              userId: ctx.session.user.id,
            },
          },
        });
      }

      // check if use has access to selected user in user settings
      const collaborator = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: ctx.session.user.id,
            ownerId: selectedUserId,
          },
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "User does not have access to selected user's favorites list",
        });
      }

      return ctx.prisma.favoriteRestaurant.findUnique({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: selectedUserId,
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
      if (ctx.session.user.settings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      const { selectedUserId } = ctx.session.user.settings;
      if (selectedUserId === ctx.session.user.id) {
        return ctx.prisma.favoriteRestaurant.update({
          where: {
            restaurantId_userId: {
              restaurantId: input.id,
              userId: ctx.session.user.id,
            },
          },
          data: {
            like: input.like,
          },
        });
      }

      // check if use has access to selected user in user settings
      const collaborator = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: ctx.session.user.id,
            ownerId: selectedUserId,
          },
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "UNAUTHORIZED",
          message:
            "User does not have access to selected user's favorites list",
        });
      }

      return ctx.prisma.favoriteRestaurant.update({
        where: {
          restaurantId_userId: {
            restaurantId: input.id,
            userId: selectedUserId,
          },
        },
        data: {
          like: input.like,
        },
      });
    }),
});
