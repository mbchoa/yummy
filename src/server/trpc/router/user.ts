import type { User } from "@prisma/client";
import { z } from "zod";
import { protectedProcedure, router } from "../trpc";

type UserSearchResult = Pick<User, "id" | "name" | "email" | "image">;

export const user = router({
  all: protectedProcedure.query(({ ctx }) => {
    return ctx.prisma.user.findMany({
      where: {
        NOT: {
          id: {
            equals: ctx.session.user.id,
          },
        },
      },
    });
  }),
  search: protectedProcedure
    .input(
      z.object({
        term: z.string(),
      }),
    )
    .query(({ input, ctx }) => {
      // prefix-match every word, stripping characters that are tsquery syntax
      const words = input.term
        .split(/\s+/)
        .map((word) => word.replace(/[&|!():*<>'\\]/g, ""))
        .filter((word) => word.length > 0);
      // a minimum length keeps the search from being used to list every user
      if (words.join("").length < 3) {
        return Promise.resolve([] as UserSearchResult[]);
      }
      const searchTerm = words.map((word) => `${word}:*`).join(" & ");
      return ctx.prisma.$queryRaw`
        SELECT "id", "name", "email", "image" FROM "public"."User"
          WHERE to_tsvector(concat_ws(' ', "public"."User"."email","public"."User"."name")) @@ to_tsquery(${searchTerm})
          AND
          "public"."User"."id" != ${ctx.session.user.id}
      ` as Promise<UserSearchResult[]>;
    }),
});
