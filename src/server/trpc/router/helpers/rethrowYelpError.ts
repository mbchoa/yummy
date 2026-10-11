import { TRPCError } from "@trpc/server";
import { HTTPError } from "got";

// Yelp couldn't find the business (e.g. it was removed) or rate-limited us:
// report a client error so it isn't retried. Auth, 5xx and network errors are
// rethrown unchanged and stay 500s.
export const rethrowYelpError = (error: unknown): never => {
  const statusCode =
    error instanceof HTTPError ? error.response.statusCode : undefined;
  if (statusCode === 404) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Restaurant not found on Yelp.",
      cause: error,
    });
  }
  if (statusCode === 429) {
    throw new TRPCError({
      code: "TOO_MANY_REQUESTS",
      message: "Too many requests to Yelp right now. Try again in a moment.",
      cause: error,
    });
  }
  throw error;
};
