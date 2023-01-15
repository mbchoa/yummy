import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const foodReview = router({
  all: protectedProcedure
    .input(z.object({ restaurantId: z.string() }))
    .query(async ({ ctx, input }) => {
      if (ctx.session.user.settings === null) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "User settings not found",
        });
      }

      const { selectedUserId } = ctx.session.user.settings;

      // check if selected user is the same as the user
      if (selectedUserId === ctx.session.user.id) {
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

      return ctx.prisma.restaurantItemReview.findMany({
        where: {
          reviewedById: selectedUserId,
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
                      userId: selectedUserId,
                    },
                  },
                },
              },
            },
          },
          reviewedBy: {
            connect: {
              id: selectedUserId,
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
    .mutation(async ({ input, ctx }) => {
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
