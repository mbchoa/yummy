import { useRouter } from "next/router";
import { useCallback } from "react";
import { Button } from "../../components/button";
import { Layout } from "../../components/layout";
import { LoggingIn } from "../../components/loggingIn";
import { NextLinkRenderer } from "../../components/nextLinkRenderer";
import { SearchWidget } from "../../components/searchWidget";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { trpc } from "../../utils/trpc";

export default function Dashboard() {
  const router = useRouter();
  const { session, loading } = useRequireAuth();
  const { data: favoriteRestaurants } = trpc.favoriteRestaurant.all.useQuery();
  const { data: restaurants } = trpc.yelp.byIds.useQuery(
    (favoriteRestaurants ?? []).map(
      (favoriteRestaurant) => favoriteRestaurant.id
    ),
    {
      enabled: favoriteRestaurants !== undefined,
    }
  );

  const maybeRenderBody = useCallback(() => {
    if (favoriteRestaurants === undefined || restaurants === undefined) {
      return <p>Loading...</p>;
    }

    if (favoriteRestaurants.length === 0) {
      return (
        <p className="w-full p-4">You have no favorite restaurants yet.</p>
      );
    }

    return (
      <section className="space-y-4 px-4">
        <h1 className="text-2xl">Favorites</h1>
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
      </section>
    );
  }, [restaurants, favoriteRestaurants]);

  if (
    loading === true ||
    session === null ||
    session.user === null ||
    router.isReady === false
  ) {
    return <LoggingIn />;
  }

  return (
    <Layout>
      <SearchWidget />
      {maybeRenderBody()}
    </Layout>
  );
}
