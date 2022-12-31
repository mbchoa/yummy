import type { User } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

export const user = router({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany();
  }),
  search: protectedProcedure
    .input(
      z.object({
        term: z.string(),
      })
    )
    .query(({ input, ctx }) => {
      const searchTerm = `${input.term}:*`;
      return ctx.prisma
        .$queryRaw`SELECT * FROM "public"."User" WHERE to_tsvector(concat_ws(' ', "public"."User"."email","public"."User"."name")) @@ to_tsquery(${searchTerm})` as Promise<
        User[]
      >;
    }),
});
