import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const userSetting = router({
  switchUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      })
    )
    .mutation(({ input, ctx }) => {
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
