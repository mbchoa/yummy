import got from "got";
import qs from "querystring";
import { z } from "zod";
import { camelCaseKeys } from "../../../lib/camelCaseKeys";
import type { IYelpBusinessSearchResponseSchema } from "../../../models/YelpSchemas";

import { protectedProcedure, router } from "../trpc";

export const yelpRouter = router({
  search: protectedProcedure
    .input(
      z.object({
        location: z.string(),
        term: z.string(),
        radius: z.number().min(0).max(40000).default(40000),
        limit: z.number().min(0).max(50).default(8),
        sortBy: z
          .enum(["best_match", "rating", "review_count", "distance"])
          .default("best_match"),
      })
    )
    .query(async ({ input }) => {
      const response = await got(
        `https://api.yelp.com/v3/businesses/search?${qs.stringify(input)}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.YELP_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      ).json<IYelpBusinessSearchResponseSchema>();
      return camelCaseKeys<IYelpBusinessSearchResponseSchema>(response);
    }),
  byId: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(({ input }) => {
      return got(`https://api.yelp.com/v3/businesses/${input.id}`, {
        headers: {
          Authorization: `Bearer ${process.env.YELP_API_KEY}`,
          "Content-Type": "application/json",
        },
      }).json();
    }),
});
