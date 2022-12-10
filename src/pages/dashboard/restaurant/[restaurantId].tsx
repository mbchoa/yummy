import { useRouter } from "next/router";
import { useCallback } from "react";
import { Layout } from "../../../components/layout";
import { trpc } from "../../../utils/trpc";

export default function FavoriteRestaurantById() {
  const { query } = useRouter<"/dashboard/restaurant/[restaurantId]">();
  const { restaurantId } = query;
  const { data: restaurant } = trpc.yelp.byId.useQuery(
    { id: restaurantId },
    { enabled: restaurantId !== undefined, refetchOnWindowFocus: false }
  );

  const maybeRenderBody = useCallback(() => {
    if (restaurant === undefined) {
      return <p>Loading...</p>;
    }

    return (
      <>
        <h1>{restaurant.name}</h1>
        <p>{restaurant.location.address1}</p>
        <p>
          {restaurant.location.city}, {restaurant.location.state}{" "}
          {restaurant.location.zipCode}
        </p>
      </>
    );
  }, [restaurant]);

  return <Layout>{maybeRenderBody()}</Layout>;
}
