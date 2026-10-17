import { z } from "zod";
import { protectedProcedure, router } from "../trpc";
import { getAccessToList, getListAccess } from "./helpers/listAccess";

export const userSetting = router({
  switchUser: protectedProcedure
    .input(
      z.object({
        userId: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      // only your own list, or one shared with you whose invite you've
      // accepted, can be selected
      await getAccessToList(ctx.prisma, ctx.session.user.id, input.userId);

      return ctx.prisma.userSetting.update({
        where: {
          userId: ctx.session.user.id,
        },
        data: {
          selectedUserId: input.userId,
        },
      });
    }),
  // the list being viewed and whether the user can change it
  access: protectedProcedure.query(({ ctx }) =>
    getListAccess(ctx.prisma, ctx.session.user),
  ),
  get: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.userSetting.findUniqueOrThrow({
      where: {
        userId: ctx.session.user.id,
      },
    });
  }),
});
