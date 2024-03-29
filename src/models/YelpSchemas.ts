import { z } from "zod";

export const YelpBusinessSchema = z.object({
  id: z.string(),
  alias: z.string(),
  name: z.string(),
  image_url: z.string(),
  is_closed: z.boolean(),
  url: z.string(),
  review_count: z.number(),
  categories: z.array(z.object({ alias: z.string(), title: z.string() })),
  rating: z.number(),
  coordinates: z.object({ latitude: z.number(), longitude: z.number() }),
  transactions: z.array(z.enum(["delivery", "pickup"])),
  location: z.object({
    address1: z.string(),
    address2: z.union([z.string(), z.null()]),
    address3: z.union([z.string(), z.null()]),
    city: z.string(),
    zip_code: z.string(),
    country: z.string(),
    state: z.string(),
    display_address: z.array(z.string()),
    cross_streets: z.string().optional(),
  }),
  phone: z.string(),
  display_phone: z.string(),
  distance: z.number(),
  is_claimed: z.boolean().optional(),
  price: z.enum(["$", "$$", "$$$", "$$$$"]),
  photos: z.array(z.string()).optional(),
  hours: z
    .array(
      z.object({
        open: z.array(
          z.object({
            is_overnight: z.boolean(),
            start: z.string(),
            end: z.string(),
            day: z.number(),
          })
        ),
        hours_type: z.string(),
        is_open_now: z.boolean(),
      })
    )
    .optional(),
  special_hours: z
    .array(
      z.object({
        date: z.string(),
        is_closed: z.boolean(),
        start: z.null(),
        end: z.null(),
        is_overnight: z.null(),
      })
    )
    .optional(),
  messaging: z
    .object({ url: z.string(), use_case_text: z.string() })
    .optional(),
});

export type IYelpBusinessSchema = z.infer<typeof YelpBusinessSchema>;

export const YelpBusinessSearchResponseSchema = z.object({
  businesses: z.array(YelpBusinessSchema),
  total: z.number(),
  region: z.object({
    center: z.object({ longitude: z.number(), latitude: z.number() }),
  }),
});

export type IYelpBusinessSearchResponseSchema = z.infer<
  typeof YelpBusinessSearchResponseSchema
>;

export const YelpBusinessReviewSchema = z.object({
  id: z.string(),
  url: z.string(),
  text: z.string(),
  rating: z.number().min(1).max(5),
  time_created: z.string(),
  user: z.object({
    id: z.string(),
    profile_url: z.string(),
    image_url: z.string(),
    name: z.string(),
  }),
});

export type IYelpBusinessReviewSchema = z.infer<
  typeof YelpBusinessReviewSchema
>;

export const YelpBusinessReviewsResponseSchema = z.object({
  reviews: z.array(YelpBusinessReviewSchema),
  total: z.number(),
  possible_languages: z.array(z.string()),
});

export type IYelpBusinessReviewsResponseSchema = z.infer<
  typeof YelpBusinessReviewsResponseSchema
>;
