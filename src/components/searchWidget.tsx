import { Combobox } from "@headlessui/react";
import { MapPinIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { retryServerErrors } from "../utils/retryServerErrors";
import { trpc, type RouterOutputs } from "../utils/trpc";

type Business = RouterOutputs["yelp"]["search"]["businesses"][number];

const DEFAULT_LOCATION = "Los Angeles, CA";
const LOCATION_STORAGE_KEY = "yummy:searchLocation";

export const SearchWidget = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState(DEFAULT_LOCATION);

  // restore the last location searched; storage can be unavailable (e.g.
  // private browsing), in which case the default is kept
  useEffect(() => {
    try {
      const savedLocation = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedLocation) {
        setLocation(savedLocation);
      }
    } catch {}
  }, []);

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
        try {
          localStorage.setItem(LOCATION_STORAGE_KEY, location);
        } catch {}
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, location, refetch]);

  const handleSelect = useCallback(
    (business: Business | null) => {
      if (business === null) {
        return;
      }
      router.push({
        pathname: "/dashboard/restaurant/[restaurantId]",
        query: { restaurantId: business.id },
      });
    },
    [router],
  );

  const renderSearchResultsContent = () => {
    if (isError) {
      const isClientError = (error.data?.httpStatus ?? 500) < 500;
      return (
        <li className="px-4 py-3 text-sm text-gray-500">
          {isClientError
            ? error.message
            : "Couldn't search right now. Check the location and try again."}
        </li>
      );
    }

    // results for the current term and location haven't loaded yet
    if (isFetching || data === undefined) {
      return <li className="px-4 py-3 text-sm text-gray-500">Searching…</li>;
    }

    if (data.businesses.length === 0) {
      return (
        <li className="px-4 py-3 text-sm text-gray-500">
          No restaurants found for &ldquo;{searchTerm}&rdquo; near {location}.
        </li>
      );
    }

    return data.businesses.map((business) => (
      <Combobox.Option
        key={business.id}
        value={business}
        className={({ active }) =>
          classNames(
            "flex cursor-pointer items-center gap-3 px-4 py-2 transition-colors",
            active && "bg-indigo-100",
          )
        }
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
            <span className="truncate font-medium">{business.name}</span>
            <span className="flex shrink-0 items-center gap-1 text-xs text-gray-600">
              <StarIcon className="h-3.5 w-3.5 text-yellow-500" aria-hidden />
              {business.rating}
              <span className="text-gray-400">({business.reviewCount})</span>
            </span>
          </div>
          <p className="truncate text-xs text-gray-500">
            {business.location.displayAddress.join(", ")}
          </p>
        </div>
      </Combobox.Option>
    ));
  };

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

  return (
    <div className="sticky z-search p-4">
      <Combobox value={null} onChange={handleSelect} nullable>
        <div className="relative flex flex-col gap-2 sm:flex-row">
          <div className="flex-1">
            <Combobox.Label className="sr-only">
              Search restaurants
            </Combobox.Label>
            <Combobox.Input
              id="restaurant-search"
              className="w-full rounded border px-3 py-2 outline-indigo-500"
              onChange={handleSearchChange}
              // nothing stays selected, so without this the input is cleared
              // whenever the results close
              displayValue={() => searchTerm}
              placeholder="Search restaurants, e.g. In 'N Out"
              name="search"
              autoComplete="off"
            />
          </div>
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
          {searchTerm.length > 0 && location.length > 0 && (
            <Combobox.Options className="absolute left-0 right-0 top-full mt-1 max-h-[70vh] overflow-y-auto rounded-lg bg-white drop-shadow-xl focus:outline-none">
              {renderSearchResultsContent()}
            </Combobox.Options>
          )}
        </div>
      </Combobox>
    </div>
  );
};
