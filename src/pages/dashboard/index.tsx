import { Tab } from "@headlessui/react";
import { Like } from "@prisma/client";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { Layout } from "../../components/layout";
import { ListDropDown } from "../../components/modules/dashboard/listDropdown";
import { RestaurantsList } from "../../components/modules/dashboard/restaurantsList";
import { SearchWidget } from "../../components/searchWidget";
import type { IYelpBusinessSchema } from "../../models/YelpSchemas";
import { trpc } from "../../utils/trpc";

export default function Dashboard() {
  const { data: session } = useSession();
  const {
    data: favoriteRestaurants,
    isLoading: isLoadingFavoriteRestaurants,
    refetch: refetchFavoriteRestaurants,
  } = trpc.favoriteRestaurant.all.useQuery(
    { like: Like.LIKE },
    { enabled: session !== undefined, keepPreviousData: true }
  );
  const {
    data: likedYelpRestaurants,
    isLoading: isLoadingFavoriteYelpRestaurants,
    refetch: refetchLikedYelpRestaurants,
  } = trpc.yelp.byIds.useQuery(
    (favoriteRestaurants ?? []).map(
      (favoriteRestaurant) => favoriteRestaurant.restaurantId
    ),
    {
      enabled: favoriteRestaurants !== undefined,
      keepPreviousData: true,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );
  const {
    data: dislikedRestaurants,
    isLoading: isLoadingDislikedRestaurants,
    refetch: refetchDislikedRestaurants,
  } = trpc.favoriteRestaurant.all.useQuery(
    { like: Like.DISLIKE },
    { enabled: session !== undefined, keepPreviousData: true }
  );
  const {
    data: dislikedYelpRestaurants,
    isLoading: isLoadingDislikedYelpRestaurants,
    refetch: refetchDislikedYelpRestaurants,
  } = trpc.yelp.byIds.useQuery(
    (dislikedRestaurants ?? []).map(
      (dislikedRestaurant) => dislikedRestaurant.restaurantId
    ),
    {
      enabled: dislikedRestaurants !== undefined,
      keepPreviousData: true,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  const refetch = useCallback(async () => {
    await refetchFavoriteRestaurants();
    await refetchLikedYelpRestaurants();
    await refetchDislikedRestaurants();
    await refetchDislikedYelpRestaurants();
  }, [
    refetchDislikedRestaurants,
    refetchDislikedYelpRestaurants,
    refetchFavoriteRestaurants,
    refetchLikedYelpRestaurants,
  ]);

  const data = useMemo(() => {
    return {
      Favorites: {
        restaurantsGroupedByCity:
          likedYelpRestaurants !== undefined
            ? groupRestaurantsByCity(likedYelpRestaurants)
            : undefined,
        isLoading:
          isLoadingFavoriteRestaurants || isLoadingFavoriteYelpRestaurants,
      },
      Dislikes: {
        restaurantsGroupedByCity:
          dislikedYelpRestaurants !== undefined
            ? groupRestaurantsByCity(dislikedYelpRestaurants)
            : undefined,
        isLoading:
          isLoadingDislikedRestaurants || isLoadingDislikedYelpRestaurants,
      },
    };
  }, [
    dislikedYelpRestaurants,
    isLoadingDislikedRestaurants,
    isLoadingDislikedYelpRestaurants,
    isLoadingFavoriteRestaurants,
    isLoadingFavoriteYelpRestaurants,
    likedYelpRestaurants,
  ]);

  const dishCountByRestaurantId = useMemo(() => {
    const counts: Record<string, number> = {};
    [...(favoriteRestaurants ?? []), ...(dislikedRestaurants ?? [])].forEach(
      (restaurant) => {
        counts[restaurant.restaurantId] = restaurant._count.restaurantItems;
      }
    );
    return counts;
  }, [favoriteRestaurants, dislikedRestaurants]);

  const maybeRenderPanels = useCallback(() => {
    return Object.values(data).map(
      ({ isLoading, restaurantsGroupedByCity }, idx) => (
        <Tab.Panel
          key={idx}
          className={classNames(
            "rounded-xl bg-white p-4",
            "ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
            "drop-shadow-md"
          )}
        >
          <RestaurantsList
            isLoading={isLoading}
            restaurants={restaurantsGroupedByCity}
            dishCountByRestaurantId={dishCountByRestaurantId}
          />
        </Tab.Panel>
      )
    );
  }, [data, dishCountByRestaurantId]);

  return (
    <Layout>
      <SearchWidget />
      <div className="px-4">
        <Tab.Group>
          <div className="flex items-center justify-between gap-4">
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
              {["Favorites", "Dislikes"].map((category) => (
                <Tab
                  key={category}
                  className={({ selected }) =>
                    classNames(
                      "rounded-lg px-6 py-2 text-sm font-medium leading-5 transition-all",
                      "ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
                      selected
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-900"
                    )
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            <ListDropDown onSwitchUser={refetch} />
          </div>
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

  // sort restaurants within each city
  Object.keys(restaurantsGroupedByCity).forEach((city) => {
    if (restaurantsGroupedByCity[city] !== undefined) {
      restaurantsGroupedByCity[city]?.sort((a, b) =>
        a.name.localeCompare(b.name)
      );
    }
  });

  return restaurantsGroupedByCity;
};
