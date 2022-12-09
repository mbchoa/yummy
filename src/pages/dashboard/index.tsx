import { useRouter } from "next/router";
import { useCallback } from "react";
import { Layout } from "../../components/layout";
import { LoggingIn } from "../../components/loggingIn";
import { useRequireAuth } from "../../hooks/useRequireAuth";
import { trpc } from "../../utils/trpc";

export default function Dashboard() {
  const router = useRouter();
  const { session, loading } = useRequireAuth();
  const { data: favoriteRestaurants } = trpc.favoriteRestaurant.all.useQuery();

  const maybeRenderBody = useCallback(() => {
    if (favoriteRestaurants === undefined) {
      return <p>Loading...</p>;
    }

    if (favoriteRestaurants.length === 0) {
      return (
        <p className="w-full p-4">You have no favorite restaurants yet.</p>
      );
    }

    return (
      <ul>
        {favoriteRestaurants.map((favoriteRestaurant) => {
          const { id, restaurant } = favoriteRestaurant;
          return (
            <li key={id}>
              <p>{restaurant.name}</p>
            </li>
          );
        })}
      </ul>
    );
  }, [favoriteRestaurants]);

  if (
    loading === true ||
    session === null ||
    session.user === null ||
    router.isReady === false
  ) {
    return <LoggingIn />;
  }

  return <Layout>{maybeRenderBody()}</Layout>;
}
