import { z } from "zod";

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

export type IYelpRestaurant = z.infer<typeof YelpRestaurantSchema>;