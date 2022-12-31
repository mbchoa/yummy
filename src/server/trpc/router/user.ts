import { protectedProcedure, router } from "../trpc";

export const user = router({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
});
