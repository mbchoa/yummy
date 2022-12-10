import { useRouter } from "next/router";
import { useCallback } from "react";
import { Layout } from "../../components/layout";
import { LoggingIn } from "../../components/loggingIn";
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
      <ul>
        {restaurants.map((restaurant) => {
          return (
            <li key={restaurant.id}>
              <p>{restaurant.name}</p>
            </li>
          );
        })}
      </ul>
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
