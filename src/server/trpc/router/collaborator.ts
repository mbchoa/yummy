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
      const { count } = await ctx.prisma.collaborator.deleteMany({
        where: {
          id: input.id,
          ownerId: ctx.session.user.id,
        },
      });

      if (count === 0) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Collaborator not found",
        });
      }
    }),
});
