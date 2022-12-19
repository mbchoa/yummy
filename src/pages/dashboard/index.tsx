import { useSession } from "next-auth/react";
import { useCallback, useMemo } from "react";
import { Button } from "../../components/button";
import { Layout } from "../../components/layout";
import { NextLinkRenderer } from "../../components/nextLinkRenderer";
import { SearchWidget } from "../../components/searchWidget";
import { trpc } from "../../utils/trpc";

export default function Dashboard() {
  const { data: session } = useSession();
  const { data: favoriteRestaurants, isLoading: isLoadingFavoriteRestaurants } =
    trpc.favoriteRestaurant.all.useQuery(undefined, {
      enabled: session !== undefined,
    });
  const { data: restaurants, isLoading: isLoadingYelpRestaurants } =
    trpc.yelp.byIds.useQuery(
      (favoriteRestaurants ?? []).map(
        (favoriteRestaurant) => favoriteRestaurant.restaurantId
      ),
      {
        enabled: favoriteRestaurants !== undefined,
      }
    );

  const restaurantsGroupedByCity = useMemo(() => {
    if (restaurants === undefined) {
      return undefined;
    }

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
  }, [restaurants]);

  const maybeRenderFavoriteRestaurants = useCallback(() => {
    if (isLoadingFavoriteRestaurants || isLoadingYelpRestaurants) {
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

    if (
      favoriteRestaurants === undefined ||
      restaurantsGroupedByCity === undefined
    ) {
      return <p className="px-4">Unable to fetch favorite restaurants.</p>;
    }

    return (
      <div className="space-y-6">
        {Object.keys(restaurantsGroupedByCity).map((city) => {
          return (
            <section className="space-y-2" key={city}>
              <h2 className="text-xl">{city}</h2>
              <ul className="space-y-2">
                {(restaurantsGroupedByCity?.[city] ?? []).map((restaurant) => {
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
  }, [
    isLoadingFavoriteRestaurants,
    isLoadingYelpRestaurants,
    favoriteRestaurants,
    restaurantsGroupedByCity,
  ]);

  return (
    <Layout>
      <SearchWidget />
      <div className="space-y-6">
        <section className="space-y-4 px-4">
          <h1 className="text-2xl font-semibold">Favorites</h1>
          {maybeRenderFavoriteRestaurants()}
        </section>
      </div>
    </Layout>
  );
}
