import { TRPCError } from "@trpc/server";
import got, { HTTPError } from "got";
import Redis from "ioredis";
import qs from "querystring";
import { z } from "zod";
import { env } from "../../../env/server.mjs";
import { camelCaseKeys } from "../../../lib/camelCaseKeys";
import {
  type IYelpBusinessReviewsResponseSchema,
  type IYelpBusinessSearchResponseSchema,
} from "../../../models/YelpSchemas";
import { publicProcedure, router } from "../trpc";
import { getYelpRestaurantById } from "./helpers/getYelpRestaurantById";

const redis = new Redis(env.RAILWAY_REDIS_URL);

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
      }),
    )
    .query(async ({ input }) => {
      try {
        const response = await got(
          `https://api.yelp.com/v3/businesses/search?${qs.stringify(input)}`,
          {
            headers: {
              Authorization: `Bearer ${process.env.YELP_API_KEY}`,
              "Content-Type": "application/json",
            },
          },
        ).json<IYelpBusinessSearchResponseSchema>();
        return camelCaseKeys<IYelpBusinessSearchResponseSchema>(response);
      } catch (error) {
        // Yelp rejected the search itself (inputs are validated above, so in
        // practice LOCATION_NOT_FOUND) or rate-limited us: report a client
        // error so it isn't retried. Auth, 5xx and network errors stay 500s.
        const statusCode =
          error instanceof HTTPError ? error.response.statusCode : undefined;
        if (statusCode === 400) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Couldn't find that location. Try a more specific one.",
            cause: error,
          });
        }
        if (statusCode === 429) {
          throw new TRPCError({
            code: "TOO_MANY_REQUESTS",
            message: "Too many searches right now. Try again in a moment.",
            cause: error,
          });
        }
        throw error;
      }
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
        restaurantIds.map((id) => getYelpRestaurantById(id, redis)),
      );
    }),
  reviews: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const cacheKey = `yelpBusinessReviews:${input.id}`;
      const cached = await redis.get(cacheKey);
      if (cached) {
        return JSON.parse(
          cached,
        ) as SnakeToCamelCaseNested<IYelpBusinessReviewsResponseSchema>;
      }

      const response = await got(
        `https://api.yelp.com/v3/businesses/${input.id}/reviews?sort_by=newest`,
        {
          headers: {
            Authorization: `Bearer ${process.env.YELP_API_KEY}`,
            "Content-Type": "application/json",
          },
        },
      ).json<IYelpBusinessReviewsResponseSchema>();
      const formattedResponse =
        camelCaseKeys<IYelpBusinessReviewsResponseSchema>(response);

      await redis.set(
        cacheKey,
        JSON.stringify(formattedResponse),
        "EX",
        60 * 60 * 24 * 7, // cache reviews for 1 week
      );
      return formattedResponse;
    }),
});
