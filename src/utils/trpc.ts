import { MutationCache, QueryClient } from "@tanstack/react-query";
import { httpBatchLink, httpLink, loggerLink, splitLink } from "@trpc/client";
import { createTRPCNext } from "@trpc/next";
import { type inferRouterInputs, type inferRouterOutputs } from "@trpc/server";
import superjson from "superjson";

import { showErrorToast } from "../components/toast";
import { type AppRouter } from "../server/trpc/router/_app";

const getBaseUrl = () => {
  if (typeof window !== "undefined") return ""; // browser should use relative url
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`; // SSR should use vercel url
  return `http://localhost:${process.env.PORT ?? 3000}`; // dev SSR should use localhost
};

export const trpc = createTRPCNext<AppRouter>({
  config() {
    const queryClient: QueryClient = new QueryClient({
      defaultOptions: {
        queries: {
          refetchOnWindowFocus: false,
        },
      },
      mutationCache: new MutationCache({
        // every failed mutation is reported to the user, and data is reloaded
        // so the page shows what the server actually saved. A mutation whose
        // error is already shown in place can opt out of the toast with
        // `meta: { skipErrorToast: true }`.
        onError: (_error, _variables, _context, mutation) => {
          if (mutation.meta?.skipErrorToast !== true) {
            showErrorToast("Couldn't save that change. Try again.");
          }
          void queryClient.invalidateQueries();
        },
      }),
    });

    return {
      transformer: superjson,
      links: [
        loggerLink({
          enabled: (opts) =>
            process.env.NODE_ENV === "development" ||
            (opts.direction === "down" && opts.result instanceof Error),
        }),
        splitLink({
          condition(op) {
            // check for context property `skipBatch`
            return op.context.skipBatch === true;
          },
          // when condition is true, use normal request
          true: httpLink({
            url: `${getBaseUrl()}/api/trpc`,
          }),
          // when condition is false, use batching
          false: httpBatchLink({
            url: `${getBaseUrl()}/api/trpc`,
          }),
        }),
      ],
      queryClient,
    };
  },
  ssr: false,
  // responseMeta({ clientErrors }) {
  //   if (clientErrors !== undefined && clientErrors.length > 0) {
  //     // propagate http first error from API calls
  //     return {
  //       status: clientErrors[0]?.data?.httpStatus ?? 500,
  //     };
  //   }
  //   // cache request for 1 day + revalidate once every second
  //   const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
  //   return {
  //     headers: {
  //       "cache-control": `s-maxage=1, stale-while-revalidate=${ONE_DAY_IN_SECONDS}`,
  //     },
  //   };
  // },
});

/**
 * Inference helper for inputs
 * @example type HelloInput = RouterInputs['example']['hello']
 **/
export type RouterInputs = inferRouterInputs<AppRouter>;
/**
 * Inference helper for outputs
 * @example type HelloOutput = RouterOutputs['example']['hello']
 **/
export type RouterOutputs = inferRouterOutputs<AppRouter>;
