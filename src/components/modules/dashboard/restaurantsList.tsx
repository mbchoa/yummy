import type { IYelpBusinessSchema } from "../../../models/YelpSchemas";
import { Button } from "../../button";
import { NextLinkRenderer } from "../../nextLinkRenderer";

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
      <ul className="space-y-2">
        {[1, 2, 3, 4, 5].map((key) => (
          <li
            key={key}
            className="h-9 w-full animate-pulse rounded bg-gray-200"
          />
        ))}
      </ul>
    );
  }

  if (restaurants === undefined) {
    return <p className="px-4">Unable to fetch favorite restaurants.</p>;
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
                    <Button
                      variant="ghost"
                      linkRenderer={NextLinkRenderer({
                        href: {
                          pathname: `/dashboard/restaurant/[restaurantId]`,
                          query: { restaurantId: restaurant.id },
                        },
                      })}
                    >
                      {restaurant.name}
                    </Button>
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
