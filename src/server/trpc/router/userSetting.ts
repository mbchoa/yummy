import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const userSetting = router({
  switchUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // only your own list or one shared with you can be selected
      if (input.userId !== ctx.session.user.id) {
        const collaborator = await ctx.prisma.collaborator.findUnique({
          where: {
            collaboratorId_ownerId: {
              collaboratorId: ctx.session.user.id,
              ownerId: input.userId,
            },
          },
        });

        if (collaborator === null) {
          throw new TRPCError({
            code: "UNAUTHORIZED",
            message: "User does not have access to selected user's list",
          });
        }
      }

      return ctx.prisma.userSetting.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          selectedUserId: input.userId,
        },
      });
    }),
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userSetting.findUniqueOrThrow({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
