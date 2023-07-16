import { Redis } from "@upstash/redis";
import got from "got";
import qs from "querystring";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { camelCaseKeys } from "../../../lib/camelCaseKeys";
import type {
  IYelpBusinessReviewsResponseSchema,
  IYelpBusinessSearchResponseSchema,
} from "../../../models/YelpSchemas";
import { publicProcedure, router } from "../trpc";
import { getYelpRestaurantById } from "./helpers/getYelpRestaurantById";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export const yelp = router({
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
      return getYelpRestaurantById(input.id, redis);
    }),
  byIds: publicProcedure
    .input(z.array(z.string()))
    .query(async ({ input: restaurantIds }) => {
      return Promise.all(
        restaurantIds.map((id) => getYelpRestaurantById(id, redis))
      );
    }),
  reviews: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `yelpBusinessReviews:${input.id}`;
      const cached = await redis.get<
        SnakeToCamelCaseNested<IYelpBusinessReviewsResponseSchema>
      >(cacheKey);
      if (cached) {
        return cached;
      }

      const response = await got(
        `https://api.yelp.com/v3/businesses/${input.id}/reviews?sort_by=newest`,
        {
          headers: {
            Authorization: `Bearer ${process.env.YELP_API_KEY}`,
            "Content-Type": "application/json",
          },
        }
      ).json<IYelpBusinessReviewsResponseSchema>();
      const formattedResponse =
        camelCaseKeys<IYelpBusinessReviewsResponseSchema>(response);

      await redis.set(
        cacheKey,
        formattedResponse,
        { ex: 60 * 60 * 24 * 7 } // cache reviews for 1 week
      );
      return formattedResponse;
    }),
});
