import got from "got";
import type { Redis } from "ioredis";
import { camelCaseKeys } from "../../../../lib/camelCaseKeys";
import type { IYelpBusinessSchema } from "../../../../models/YelpSchemas";
import { rethrowYelpError } from "./rethrowYelpError";

export const getYelpRestaurantById = async (id: string, redis: Redis) => {
  const cacheKey = `yelpBusinessId:${id}`;
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached) as SnakeToCamelCaseNested<IYelpBusinessSchema>;
  }

  const response = await got(
    `https://api.yelp.com/v3/businesses/${encodeURIComponent(id)}`,
    {
      headers: {
        Authorization: `Bearer ${process.env.YELP_API_KEY}`,
        "Content-Type": "application/json",
      },
    },
  )
    .json<IYelpBusinessSchema>()
    .catch(rethrowYelpError);
  const formattedResponse = camelCaseKeys<IYelpBusinessSchema>(response);
  await redis.set(
    cacheKey,
    JSON.stringify(formattedResponse),
    "EX",
    60 * 60 * 24 * 30,
  ); // cache restaurant info for 30 days
  return formattedResponse;
};
