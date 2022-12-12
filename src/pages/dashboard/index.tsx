import { useSession } from "next-auth/react";
import { useCallback } from "react";
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
        (favoriteRestaurant) => favoriteRestaurant.id
      ),
      {
        enabled: favoriteRestaurants !== undefined,
      }
    );

  const maybeRenderFavoriteRestaurants = useCallback(() => {
    if (isLoadingFavoriteRestaurants || isLoadingYelpRestaurants) {
      return (
        <ul className="space-y-2">
          {[1, 2, 3].map((key) => (
            <li
              key={key}
              className="h-9 w-full animate-pulse rounded bg-gray-200"
            />
          ))}
        </ul>
      );
    }

    if (favoriteRestaurants === undefined || restaurants === undefined) {
      return <p className="px-4">Unable to fetch favorite restaurants.</p>;
    }

    return (
      <ul className="space-y-2">
        {restaurants.map((restaurant) => {
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
    );
  }, [
    isLoadingFavoriteRestaurants,
    isLoadingYelpRestaurants,
    favoriteRestaurants,
    restaurants,
  ]);

  return (
    <Layout>
      <SearchWidget />
      <section className="space-y-4 px-4">
        <h1 className="text-2xl">Favorites</h1>
        {maybeRenderFavoriteRestaurants()}
      </section>
    </Layout>
  );
}
