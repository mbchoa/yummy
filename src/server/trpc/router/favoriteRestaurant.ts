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
      // get user settings
      const userSettings = await ctx.prisma.userSetting.findUnique({
        where: {
          userId: ctx.session.user.id,
        },
      });

      if (userSettings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      // check if selected user is the same as the user
      if (userSettings.selectedUserId === ctx.session.user.id) {
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
            ownerId: userSettings.selectedUserId,
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
          userId: userSettings.selectedUserId,
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
    .mutation(({ input, ctx }) => {
      return ctx.prisma.favoriteRestaurant.create({
        data: {
          restaurantId: input.id,
          userId: ctx.session.user.id,
          like: input.like,
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
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        like: z.enum([Like.LIKE, Like.DISLIKE, Like.UNSELECTED]),
      })
    )
    .mutation(({ input, ctx }) => {
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
    }),
});
