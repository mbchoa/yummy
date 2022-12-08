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
  }),
  phone: z.string(),
  display_phone: z.string(),
  distance: z.number(),
});

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

export type IYelpBusinessSchema = z.infer<typeof YelpBusinessSchema>;

// TODO deprecate this in favor of YelpBusinessSchema
export const YelpRestaurantSchema = z.object({
  id: z.string(),
  alias: z.string(),
  name: z.string(),
  imageUrl: z.string(),
  isClosed: z.boolean(),
  url: z.string(),
  reviewCount: z.number(),
  rating: z.number(),
  price: z.string(),
  address1: z.string(),
  address2: z.string().optional(),
  address3: z.string().optional(),
  city: z.string(),
  zipCode: z.string(),
  country: z.string(),
  state: z.string(),
  distance: z.number(),
});
