import { Tab } from "@headlessui/react";
import { Like } from "@prisma/client";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { Layout } from "../../components/layout";
import { ListDropDown } from "../../components/modules/dashboard/listDropdown";
import { RestaurantsList } from "../../components/modules/dashboard/restaurantsList";
import type { IYelpBusinessSchema } from "../../models/YelpSchemas";
import { requireAuth } from "../../server/common/require-auth";
import { trpc } from "../../utils/trpc";

export default function Dashboard() {
  const { data: session } = useSession();
  const {
    data: favoriteRestaurants,
    isLoading: isLoadingFavoriteRestaurants,
    refetch: refetchFavoriteRestaurants,
  } = trpc.favoriteRestaurant.all.useQuery(
    { like: Like.LIKE },
    { enabled: session !== undefined, keepPreviousData: true },
  );
  const {
    data: likedYelpRestaurants,
    isLoading: isLoadingFavoriteYelpRestaurants,
    isPreviousData: isPreviousLikedYelpRestaurants,
    refetch: refetchLikedYelpRestaurants,
  } = trpc.yelp.byIds.useQuery(
    (favoriteRestaurants ?? []).map(
      (favoriteRestaurant) => favoriteRestaurant.restaurantId,
    ),
    {
      enabled: favoriteRestaurants !== undefined,
      keepPreviousData: true,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  );
  const {
    data: dislikedRestaurants,
    isLoading: isLoadingDislikedRestaurants,
    refetch: refetchDislikedRestaurants,
  } = trpc.favoriteRestaurant.all.useQuery(
    { like: Like.DISLIKE },
    { enabled: session !== undefined, keepPreviousData: true },
  );
  const {
    data: dislikedYelpRestaurants,
    isLoading: isLoadingDislikedYelpRestaurants,
    isPreviousData: isPreviousDislikedYelpRestaurants,
    refetch: refetchDislikedYelpRestaurants,
  } = trpc.yelp.byIds.useQuery(
    (dislikedRestaurants ?? []).map(
      (dislikedRestaurant) => dislikedRestaurant.restaurantId,
    ),
    {
      enabled: dislikedRestaurants !== undefined,
      keepPreviousData: true,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
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
        missingRestaurantIds: findMissingRestaurantIds(
          favoriteRestaurants,
          likedYelpRestaurants,
          isPreviousLikedYelpRestaurants,
        ),
        isLoading:
          isLoadingFavoriteRestaurants || isLoadingFavoriteYelpRestaurants,
      },
      Dislikes: {
        restaurantsGroupedByCity:
          dislikedYelpRestaurants !== undefined
            ? groupRestaurantsByCity(dislikedYelpRestaurants)
            : undefined,
        missingRestaurantIds: findMissingRestaurantIds(
          dislikedRestaurants,
          dislikedYelpRestaurants,
          isPreviousDislikedYelpRestaurants,
        ),
        isLoading:
          isLoadingDislikedRestaurants || isLoadingDislikedYelpRestaurants,
      },
    };
  }, [
    dislikedRestaurants,
    dislikedYelpRestaurants,
    favoriteRestaurants,
    isLoadingDislikedRestaurants,
    isLoadingDislikedYelpRestaurants,
    isLoadingFavoriteRestaurants,
    isLoadingFavoriteYelpRestaurants,
    isPreviousDislikedYelpRestaurants,
    isPreviousLikedYelpRestaurants,
    likedYelpRestaurants,
  ]);

  const dishCountByRestaurantId = useMemo(() => {
    const counts: Record<string, number> = {};
    [...(favoriteRestaurants ?? []), ...(dislikedRestaurants ?? [])].forEach(
      (restaurant) => {
        counts[restaurant.restaurantId] = restaurant._count.restaurantItems;
      },
    );
    return counts;
  }, [favoriteRestaurants, dislikedRestaurants]);

  const maybeRenderPanels = useCallback(() => {
    return Object.values(data).map(
      ({ isLoading, restaurantsGroupedByCity, missingRestaurantIds }, idx) => (
        <Tab.Panel
          key={idx}
          className={classNames(
            "rounded-xl bg-white p-4",
            "ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
            "drop-shadow-md",
          )}
        >
          <RestaurantsList
            isLoading={isLoading}
            restaurants={restaurantsGroupedByCity}
            missingRestaurantIds={missingRestaurantIds}
            dishCountByRestaurantId={dishCountByRestaurantId}
          />
        </Tab.Panel>
      ),
    );
  }, [data, dishCountByRestaurantId]);

  return (
    <Layout>
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
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-900",
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

// saved restaurants that Yelp no longer has; yelp.byIds skips them, so they
// would otherwise vanish from the dashboard
const findMissingRestaurantIds = (
  savedRestaurants: { restaurantId: string }[] | undefined,
  yelpRestaurants: { id: string }[] | undefined,
  isPreviousData: boolean,
) => {
  // while Yelp data from the previous list is still shown, the two lists don't
  // correspond
  if (
    savedRestaurants === undefined ||
    yelpRestaurants === undefined ||
    isPreviousData
  ) {
    return [];
  }
  const yelpIds = new Set(yelpRestaurants.map((restaurant) => restaurant.id));
  return savedRestaurants
    .map((restaurant) => restaurant.restaurantId)
    .filter((restaurantId) => !yelpIds.has(restaurantId));
};

const groupRestaurantsByCity = (
  restaurants: SnakeToCamelCaseNested<IYelpBusinessSchema>[],
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
        a.name.localeCompare(b.name),
      );
    }
  });

  return restaurantsGroupedByCity;
};

export const getServerSideProps = requireAuth;
