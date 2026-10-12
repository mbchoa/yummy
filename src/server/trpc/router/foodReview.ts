import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

// notes are optional; a blank note is stored as null
const noteSchema = z
  .string()
  .trim()
  .max(500)
  .transform((note) => (note.length > 0 ? note : null));

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
        name: z.string().trim().min(1),
        review: noteSchema.optional(),
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

      // check if selected user is the same as the user
      if (selectedUserId === ctx.session.user.id) {
        await assertDishNotLogged(
          ctx.prisma,
          input.name,
          input.restaurantId,
          ctx.session.user.id,
        );
        return ctx.prisma.restaurantItemReview.create({
          data: {
            like: input.like,
            review: input.review,
            restaurantItem: {
              connectOrCreate: {
                where: {
                  name_restaurantId_userId: {
                    name: input.name,
                    restaurantId: input.restaurantId,
                    userId: ctx.session.user.id,
                  },
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

      await assertDishNotLogged(
        ctx.prisma,
        input.name,
        input.restaurantId,
        selectedUserId,
      );
      return ctx.prisma.restaurantItemReview.create({
        data: {
          like: input.like,
          review: input.review,
          restaurantItem: {
            connectOrCreate: {
              where: {
                name_restaurantId_userId: {
                  name: input.name,
                  restaurantId: input.restaurantId,
                  userId: selectedUserId,
                },
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
        like: z.enum(["LIKE", "DISLIKE", "UNSELECTED"]).optional(),
        review: noteSchema.optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      await assertCanEditFoodReview(ctx.prisma, ctx.session.user.id, input.id);
      return ctx.prisma.restaurantItemReview.update({
        where: {
          id: input.id,
        },
        data: {
          like: input.like,
          review: input.review,
        },
      });
    }),
  remove: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input, ctx }) => {
      await assertCanEditFoodReview(ctx.prisma, ctx.session.user.id, input.id);
      return ctx.prisma.restaurantItemReview.delete({
        where: {
          id: input.id,
        },
      });
    }),
});

// each dish is listed once per restaurant; adding a second review for it would
// show up as a duplicate entry
const assertDishNotLogged = async (
  prisma: PrismaClient,
  name: string,
  restaurantId: string,
  ownerId: string,
) => {
  const loggedDish = await prisma.restaurantItem.findFirst({
    where: {
      name: { equals: name, mode: "insensitive" },
      restaurantId,
      userId: ownerId,
      restaurantItemReview: { some: {} },
    },
  });

  if (loggedDish !== null) {
    throw new TRPCError({
      code: "CONFLICT",
      message: `You've already logged ${loggedDish.name} here.`,
    });
  }
};

// a food review can be edited by the owner of the list it belongs to, or by
// one of that owner's collaborators
const assertCanEditFoodReview = async (
  prisma: PrismaClient,
  userId: string,
  foodReviewId: string,
) => {
  const foodReview = await prisma.restaurantItemReview.findUnique({
    where: {
      id: foodReviewId,
    },
    include: {
      restaurantItem: {
        select: {
          userId: true,
        },
      },
    },
  });

  if (foodReview === null) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Food review not found",
    });
  }

  const ownerId = foodReview.restaurantItem.userId;
  if (ownerId === userId) {
    return;
  }

  const collaborator = await prisma.collaborator.findUnique({
    where: {
      collaboratorId_ownerId: {
        collaboratorId: userId,
        ownerId,
      },
    },
  });

  if (collaborator === null) {
    throw new TRPCError({
      code: "UNAUTHORIZED",
      message: "User does not have access to this food review",
    });
  }
};
