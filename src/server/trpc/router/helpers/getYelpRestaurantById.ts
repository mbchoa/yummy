import type { Redis } from "@upstash/redis/nodejs";
import got from "got";
import { camelCaseKeys } from "../../../../lib/camelCaseKeys";
import type { IYelpBusinessSchema } from "../../../../models/YelpSchemas";

export const getYelpRestaurantById = async (id: string, redis: Redis) => {
  const cacheKey = `yelpBusinessId:${id}`;
  const cached = await redis.get<SnakeToCamelCaseNested<IYelpBusinessSchema>>(
    cacheKey
  );
  if (cached) {
    return cached;
  }

  const response = await got(`https://api.yelp.com/v3/businesses/${id}`, {
    headers: {
      Authorization: `Bearer ${process.env.YELP_API_KEY}`,
      "Content-Type": "application/json",
    },
  }).json<IYelpBusinessSchema>();
  const formattedResponse = camelCaseKeys<IYelpBusinessSchema>(response);
  await redis.set(cacheKey, formattedResponse);
  await redis.expire(cacheKey, 60 * 60 * 24 * 30); // cache restaurant info for 30 days
  return formattedResponse;
};
