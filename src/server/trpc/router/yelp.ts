import got from "got";
import qs from "querystring";
import { z } from "zod";
import { camelCaseKeys } from "../../../lib/camelCaseKeys";
import type {
  IYelpBusinessSchema,
  IYelpBusinessSearchResponseSchema,
} from "../../../models/YelpSchemas";

import { publicProcedure, router } from "../trpc";

export const yelpRouter = router({
  search: publicProcedure
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
  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const response = await got(
        `https://api.yelp.com/v3/businesses/${input.id}`,
        {
          headers: {
            Authorization: `Bearer ${process.env.YELP_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      ).json<IYelpBusinessSchema>();
      return camelCaseKeys<IYelpBusinessSchema>(response);
    }),
  byIds: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input: restaurantIds }) => {
      return Promise.all(
        restaurantIds.map((id) =>
          got(`https://api.yelp.com/v3/businesses/${id}`, {
            headers: {
              Authorization: `Bearer ${process.env.YELP_API_KEY}`,
              "Content-Type": "application/json",
            },
          }).json<IYelpBusinessSchema>()
        )
      ).then((jsonResponses) =>
        jsonResponses.map((json) => {
          return camelCaseKeys<IYelpBusinessSchema>(json);
        })
      );
    }),
});
