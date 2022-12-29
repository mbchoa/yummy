import { Tab } from "@headlessui/react";
import { Like } from "@prisma/client";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { Layout } from "../../components/layout";
import { RestaurantsList } from "../../components/modules/dashboard/restaurantsList";
import { SearchWidget } from "../../components/searchWidget";
import type { IYelpBusinessSchema } from "../../models/YelpSchemas";
import { trpc } from "../../utils/trpc";

export default function Dashboard() {
  const { data: session } = useSession();
  const { data: favoriteRestaurants, isLoading: isLoadingFavoriteRestaurants } =
    trpc.favoriteRestaurant.all.useQuery(
      { like: Like.LIKE },
      { enabled: session !== undefined }
    );
  const { data: restaurants, isLoading: isLoadingYelpRestaurants } =
    trpc.yelp.byIds.useQuery(
      (favoriteRestaurants ?? []).map(
        (favoriteRestaurant) => favoriteRestaurant.restaurantId
      ),
      { enabled: favoriteRestaurants !== undefined }
    );

  const data = useMemo(() => {
    return {
      Favorites: {
        restaurantsGroupedByCity:
          restaurants !== undefined
            ? groupRestaurantsByCity(restaurants)
            : undefined,
        isLoading: isLoadingFavoriteRestaurants || isLoadingYelpRestaurants,
      },
      Dislikes: {
        restaurantsGroupedByCity:
          restaurants !== undefined
            ? groupRestaurantsByCity(restaurants)
            : undefined,
        isLoading: isLoadingFavoriteRestaurants || isLoadingYelpRestaurants,
      },
    };
  }, [isLoadingFavoriteRestaurants, isLoadingYelpRestaurants, restaurants]);

  const maybeRenderPanels = useCallback(() => {
    return Object.values(data).map(
      ({ isLoading, restaurantsGroupedByCity }, idx) => (
        <Tab.Panel
          key={idx}
          className={classNames(
            "rounded-xl bg-white p-3",
            "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2"
          )}
        >
          <RestaurantsList
            isLoading={isLoading}
            restaurants={restaurantsGroupedByCity}
          />
        </Tab.Panel>
      )
    );
  }, [data]);

  return (
    <Layout>
      <SearchWidget />
      <div className="px-4">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
            {["Favorites", "Dislikes"].map((category) => (
              <Tab
                key={category}
                className={({ selected }) =>
                  classNames(
                    "w-full rounded-lg py-2.5 text-sm font-medium leading-5 text-blue-700",
                    "ring-white ring-opacity-60 ring-offset-2 ring-offset-blue-400 focus:outline-none focus:ring-2",
                    selected
                      ? "bg-white shadow"
                      : "text-blue-100 hover:bg-white/[0.12] hover:text-white"
                  )
                }
              >
                {category}
              </Tab>
            ))}
          </Tab.List>
          <Tab.Panels className="mt-4">{maybeRenderPanels()}</Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}

const groupRestaurantsByCity = (
  restaurants: SnakeToCamelCaseNested<IYelpBusinessSchema>[]
) => {
  const restaurantsGroupedByCity: Record<string, typeof restaurants> = {};
  restaurants.forEach((restaurant) => {
    const city = restaurant.location.city;
    const restaurantsInCity = restaurantsGroupedByCity[city];
    if (restaurantsInCity === undefined) {
      restaurantsGroupedByCity[city] = [restaurant];
    } else {
      restaurantsGroupedByCity[city] = [...restaurantsInCity, restaurant];
    }
  });

  return restaurantsGroupedByCity;
};
