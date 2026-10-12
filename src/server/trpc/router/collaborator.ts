import type { PrismaClient } from "@prisma/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const collaborator = router({
  allOwner: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.collaborator.findMany({
      where: {
        collaboratorId: ctx.session.user.id,
      },
      include: {
        owner: true,
        collaborator: true,
      },
    });
  }),
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.collaborator.findMany({
      where: {
        ownerId: ctx.session.user.id,
      },
      include: {
        collaborator: true,
      },
    });
  }),
  add: protectedProcedure
    .input(
      z.object({
        collaboratorId: z.string(),
      }),
    )
    .mutation(({ input, ctx }) => {
      if (input.collaboratorId === ctx.session.user.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "You can't add yourself as a collaborator",
        });
      }

      return ctx.prisma.collaborator.create({
        data: {
          ownerId: ctx.session.user.id,
          collaboratorId: input.collaboratorId,
        },
      });
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const collaborator = await ctx.prisma.collaborator.findFirst({
        where: {
          id: input.id,
          ownerId: ctx.session.user.id,
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collaborator not found",
        });
      }

      await revokeAccess(
        ctx.prisma,
        collaborator.collaboratorId,
        collaborator.ownerId,
      );
    }),
  // stop collaborating on a list someone else shared with you
  leave: protectedProcedure
    .input(
      z.object({
        ownerId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const collaborator = await ctx.prisma.collaborator.findUnique({
        where: {
          collaboratorId_ownerId: {
            collaboratorId: ctx.session.user.id,
            ownerId: input.ownerId,
          },
        },
      });

      if (collaborator === null) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Shared list not found",
        });
      }

      await revokeAccess(ctx.prisma, ctx.session.user.id, input.ownerId);
    }),
});

// removes the collaborator's access, and if they were viewing that list,
// switches them back to their own so they don't land on a list they can't load
const revokeAccess = (
  prisma: PrismaClient,
  collaboratorId: string,
  ownerId: string,
) =>
  prisma.$transaction([
    prisma.collaborator.delete({
      where: {
        collaboratorId_ownerId: { collaboratorId, ownerId },
      },
    }),
    prisma.userSetting.updateMany({
      where: { userId: collaboratorId, selectedUserId: ownerId },
      data: { selectedUserId: collaboratorId },
    }),
  ]);
