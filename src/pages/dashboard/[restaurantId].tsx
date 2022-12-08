import type { GetServerSideProps } from "next";
import { useCallback } from "react";
import { Layout } from "../../components/layout";
import { getParamFromPath } from "../../lib/getParamFromPath";
import { trpc } from "../../utils/trpc";

interface IRestaurantProps {
  restaurantId: string;
}

export default function RestaurantById({ restaurantId }: IRestaurantProps) {
  const { data: favoriteRestaurant } = trpc.favoriteRestaurant.byId.useQuery({
    id: restaurantId,
  });

  const maybeRenderBody = useCallback(() => {
    if (favoriteRestaurant?.restaurant === undefined) {
      return <p>Loading...</p>;
    }

    const { restaurant } = favoriteRestaurant;
    return (
      <>
        <h1>{restaurant.name}</h1>
        <p>{restaurant.address1}</p>
        <p>
          {restaurant.city}, {restaurant.state} {restaurant.zipCode}
        </p>
      </>
    );
  }, [favoriteRestaurant]);

  return <Layout>{maybeRenderBody()}</Layout>;
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const restaurantId = getParamFromPath(ctx.params, "restaurantId");
  if (restaurantId === undefined) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      restaurantId,
    },
  };
};
