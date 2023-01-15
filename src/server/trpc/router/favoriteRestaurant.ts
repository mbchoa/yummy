import { Like } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const favoriteRestaurant = router({
  all: protectedProcedure
    .input(
      z
        .object({
          like: z.enum([Like.LIKE, Like.DISLIKE, Like.UNSELECTED]),
        })
        .optional()
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
      });
    }),
  add: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        like: z.enum([Like.LIKE, Like.DISLIKE]),
      })
    )
    .mutation(async ({ input, ctx }) => {
      if (ctx.session.user.settings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      const { selectedUserId } = ctx.session.user.settings;

      // check if selected user is the same as the user
      if (selectedUserId === ctx.session.user.id) {
        return ctx.prisma.favoriteRestaurant.create({
          data: {
            restaurantId: input.id,
            userId: ctx.session.user.id,
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

      return ctx.prisma.favoriteRestaurant.create({
        data: {
          restaurantId: input.id,
          userId: selectedUserId,
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
        return ctx.prisma.favoriteRestaurant.findUniqueOrThrow({
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

      return ctx.prisma.favoriteRestaurant.findUniqueOrThrow({
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
      })
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
