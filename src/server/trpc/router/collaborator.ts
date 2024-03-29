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
      })
    )
    .mutation(({ input, ctx }) => {
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
      })
    )
    .mutation(({ input, ctx }) => {
      return ctx.prisma.collaborator.delete({
        where: {
          id: input.id,
        },
      });
    }),
});
