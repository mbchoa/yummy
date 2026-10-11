import { MapPinIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { retryServerErrors } from "../utils/retryServerErrors";
import { trpc } from "../utils/trpc";

export const SearchWidget = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("Los Angeles, CA");
  const [isFocused, setIsFocused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, refetch, isFetching, isError, error } =
    trpc.yelp.search.useQuery(
      {
        location,
        term: searchTerm,
      },
      {
        enabled: false,
        retry: retryServerErrors,
        trpc: {
          context: {
            skipBatch: true,
          },
        },
      },
    );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length > 0 && location.length > 0) {
        refetch();
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, location, refetch]);

  const renderSearchResultsContent = useCallback(() => {
    if (isError) {
      const isClientError = (error.data?.httpStatus ?? 500) < 500;
      return (
        <p className="px-4 py-3 text-sm text-gray-500">
          {isClientError
            ? error.message
            : "Couldn't search right now. Check the location and try again."}
        </p>
      );
    }

    // results for the current term and location haven't loaded yet
    if (isFetching || data === undefined) {
      return <p className="px-4 py-3 text-sm text-gray-500">Searching…</p>;
    }

    if (data.businesses.length === 0) {
      return (
        <p className="px-4 py-3 text-sm text-gray-500">
          No restaurants found for &ldquo;{searchTerm}&rdquo; near {location}.
        </p>
      );
    }

    return (
      <ul>
        {data.businesses.map((business) => {
          return (
            <li
              key={business.id}
              className="transition-colors hover:bg-indigo-100"
            >
              <Link
                className="flex items-center gap-3 px-4 py-2"
                href={{
                  pathname: "/dashboard/restaurant/[restaurantId]",
                  query: { restaurantId: business.id },
                }}
              >
                {business.imageUrl ? (
                  <Image
                    className="h-10 w-10 shrink-0 rounded object-cover"
                    src={business.imageUrl}
                    alt=""
                    width={40}
                    height={40}
                  />
                ) : (
                  <div className="h-10 w-10 shrink-0 rounded bg-gray-200" />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline justify-between gap-2">
                    <span className="truncate font-medium">
                      {business.name}
                    </span>
                    <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600">
                      <StarIcon
                        className="h-3.5 w-3.5 text-yellow-500"
                        aria-hidden
                      />
                      {business.rating}
                      <span className="text-gray-400">
                        ({business.reviewCount})
                      </span>
                    </span>
                  </div>
                  <p className="truncate text-xs text-gray-500">
                    {business.location.displayAddress.join(", ")}
                  </p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }, [data, error, isError, isFetching, searchTerm, location]);

  const maybeRenderSearchResults = useCallback(() => {
    if (searchTerm.length === 0 || location.length === 0 || !isFocused) {
      return null;
    }

    return (
      <div className="absolute left-0 right-0 top-full mt-1 max-h-[70vh] overflow-y-auto rounded-lg bg-white drop-shadow-xl">
        {renderSearchResultsContent()}
      </div>
    );
  }, [searchTerm, location, isFocused, renderSearchResultsContent]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    [],
  );

  const handleLocationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocation(event.target.value);
    },
    [],
  );

  const handleFocusChange = useCallback(() => {
    setIsFocused(true);
  }, []);

  useClickAway(ref, () => {
    setIsFocused(false);
  });

  return (
    <div className="sticky z-search p-4" onFocus={handleFocusChange} ref={ref}>
      <div className="relative flex flex-col gap-2 sm:flex-row">
        <label className="flex-1">
          <span className="sr-only">Search restaurants</span>
          <input
            className="w-full rounded border px-3 py-2 outline-indigo-500"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search restaurants, e.g. In 'N Out"
            name="search"
            autoComplete="off"
          />
        </label>
        <label className="relative sm:w-1/3">
          <span className="sr-only">Location</span>
          <MapPinIcon
            className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400"
            aria-hidden
          />
          <input
            className="w-full rounded border py-2 pl-10 pr-3 outline-indigo-500"
            value={location}
            onChange={handleLocationChange}
            placeholder="City or neighborhood"
            name="location"
          />
        </label>
        {maybeRenderSearchResults()}
      </div>
    </div>
  );
};
