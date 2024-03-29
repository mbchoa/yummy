import { InformationCircleIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import type { IYelpBusinessSchema } from "../../../models/YelpSchemas";

interface IRestaurantsListProps {
  isLoading: boolean;
  restaurants:
    | Record<string, SnakeToCamelCaseNested<IYelpBusinessSchema>[]>
    | undefined;
}

export const RestaurantsList = ({
  isLoading,
  restaurants,
}: IRestaurantsListProps) => {
  if (isLoading) {
    return (
      <div className="space-y-6">
        {[1, 2].map((key) => (
          <section key={key} className="space-y-2">
            <h2 className="h-7 w-1/2 animate-pulse rounded bg-gray-200 text-xl" />
            <ul className="space-y-2">
              {[1, 2, 3, 4, 5].map((key) => (
                <li
                  key={key}
                  className="h-5 w-3/4 animate-pulse rounded bg-gray-200"
                />
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

  if (Object.keys(restaurants).length === 0) {
    return (
      <div className="flex h-60 flex-col items-center justify-center space-y-4">
        <InformationCircleIcon className="h-10 w-10 text-gray-400" />
        <p>No restaurants added yet.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {Object.keys(restaurants).map((city) => {
        return (
          <section className="space-y-2" key={city}>
            <h2 className="text-xl">{city}</h2>
            <ul className="space-y-2">
              {(restaurants?.[city] ?? []).map((restaurant) => {
                return (
                  <li key={restaurant.id}>
                    <Link
                      className="inline-flex h-min items-center rounded-md border border-transparent py-2 text-sm font-medium text-indigo-600 focus:outline-none"
                      href={{
                        pathname: `/dashboard/restaurant/[restaurantId]`,
                        query: { restaurantId: restaurant.id },
                      }}
                    >
                      {restaurant.name}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
};
