import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import Link from "next/link";
import type { IYelpBusinessSchema } from "../../../models/YelpSchemas";
import { YelpLogo, YelpStars } from "../../yelp";

interface IRestaurantsListProps {
  isLoading: boolean;
  restaurants:
    | Record<string, SnakeToCamelCaseNested<IYelpBusinessSchema>[]>
    | undefined;
  // saved restaurants Yelp no longer has, so there are no details to show
  missingRestaurantIds: string[];
  dishCountByRestaurantId: Record<string, number>;
  likedDishNamesByRestaurantId: Record<string, string[]>;
  // a filter is active, so an empty list means nothing matched
  isFiltered: boolean;
}

// the search box is in the page layout
const focusRestaurantSearch = () => {
  document.getElementById("restaurant-search")?.focus();
};

export const RestaurantsList = ({
  isLoading,
  restaurants,
  missingRestaurantIds,
  dishCountByRestaurantId,
  likedDishNamesByRestaurantId,
  isFiltered,
}: IRestaurantsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((key) => (
          <section key={key} className="space-y-2">
            <h2 className="h-7 w-1/2 animate-pulse rounded bg-gray-200 text-xl" />
            <ul className="divide-y divide-gray-100">
              {[1, 2, 3].map((key) => (
                <li key={key} className="flex items-center gap-3 py-2">
                  <div className="h-12 w-12 shrink-0 animate-pulse rounded bg-gray-200" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-1/2 animate-pulse rounded bg-gray-200" />
                    <div className="h-3 w-1/3 animate-pulse rounded bg-gray-200" />
                  </div>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    );
  }

  if (restaurants === undefined) {
    return <p className="px-4">Unable to fetch favorite restaurants.</p>;
  }

  if (
    Object.keys(restaurants).length === 0 &&
    missingRestaurantIds.length === 0
  ) {
    if (isFiltered) {
      return (
        <p className="py-8 text-center text-sm text-gray-600">
          No restaurants match your filter.
        </p>
      );
    }
    return (
      <div className="flex h-60 flex-col items-center justify-center space-y-4 text-center">
        <InformationCircleIcon className="h-10 w-10 text-gray-400" />
        <p>No restaurants added yet.</p>
        <p className="text-sm text-gray-600">
          Find one with search, then rate it 👍 or 👎 to save it here.
        </p>
        <button
          type="button"
          className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2"
          onClick={focusRestaurantSearch}
        >
          Search for a restaurant
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.keys(restaurants).map((city) => {
        return (
          <section className="space-y-1" key={city}>
            <h2 className="text-lg font-medium text-gray-900">{city}</h2>
            <ul className="divide-y divide-gray-100">
              {(restaurants?.[city] ?? []).map((restaurant) => {
                const dishCount = dishCountByRestaurantId[restaurant.id] ?? 0;
                const likedDishNames =
                  likedDishNamesByRestaurantId[restaurant.id] ?? [];
                return (
                  <li key={restaurant.id}>
                    {/* the name's link stretches over the whole row, and the
                    Yelp rating sits above it as its own link, since a link
                    can't contain another link */}
                    <div className="relative -mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-indigo-50">
                      {restaurant.imageUrl ? (
                        <Image
                          className="h-12 w-12 shrink-0 rounded object-cover"
                          src={restaurant.imageUrl}
                          alt=""
                          width={48}
                          height={48}
                        />
                      ) : (
                        <div className="h-12 w-12 shrink-0 rounded bg-gray-200" />
                      )}
                      <div className="min-w-0 flex-1">
                        <Link
                          className="block truncate font-medium text-indigo-600 after:absolute after:inset-0 after:rounded-md focus:outline-none focus-visible:after:ring-2 focus-visible:after:ring-indigo-500"
                          href={{
                            pathname: `/dashboard/restaurant/[restaurantId]`,
                            query: { restaurantId: restaurant.id },
                          }}
                        >
                          {restaurant.name}
                        </Link>
                        <a
                          href={restaurant.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="relative z-10 inline-flex items-center gap-1.5 text-xs text-gray-500 hover:underline"
                        >
                          <YelpStars rating={restaurant.rating} size="small" />
                          {restaurant.reviewCount.toLocaleString()} reviews
                        </a>
                        <p className="truncate text-sm text-gray-500">
                          {restaurant.location.address1} &middot; {dishCount}{" "}
                          {dishCount === 1 ? "dish" : "dishes"} logged
                        </p>
                        {likedDishNames.length > 0 && (
                          <p className="truncate text-sm text-green-800">
                            <span aria-hidden>👍 </span>
                            <span className="sr-only">Liked dishes: </span>
                            {likedDishNames.join(", ")}
                          </p>
                        )}
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
      {missingRestaurantIds.length > 0 && (
        <section className="space-y-1">
          <h2 className="text-lg font-medium text-gray-900">
            No longer on Yelp
          </h2>
          <ul className="divide-y divide-gray-100">
            {missingRestaurantIds.map((restaurantId) => {
              const dishCount = dishCountByRestaurantId[restaurantId] ?? 0;
              return (
                <li key={restaurantId}>
                  <Link
                    className="-mx-2 flex items-center gap-3 rounded-md px-2 py-2 transition-colors hover:bg-indigo-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500"
                    href={{
                      pathname: `/dashboard/restaurant/[restaurantId]`,
                      query: { restaurantId },
                    }}
                  >
                    <div className="h-12 w-12 shrink-0 rounded bg-gray-200" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-gray-600">
                        Restaurant removed from Yelp
                      </p>
                      <p className="truncate text-sm text-gray-500">
                        {dishCount} {dishCount === 1 ? "dish" : "dishes"} logged
                        &middot; view or remove
                      </p>
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      {Object.keys(restaurants).length > 0 && (
        <p className="flex items-center justify-end gap-1.5 text-xs text-gray-500">
          Restaurant details from
          <YelpLogo href="https://www.yelp.com" />
        </p>
      )}
    </div>
  );
};
