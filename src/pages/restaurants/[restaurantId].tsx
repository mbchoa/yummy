import type { GetServerSideProps } from "next";
import { Layout } from "../../components/layout";
import { getParamFromPath } from "../../lib/getParamFromPath";

interface IRestaurantProps {
  restaurantId: string;
}

export default function RestaurantById({ restaurantId }: IRestaurantProps) {
  return <Layout>hello {restaurantId}</Layout>;
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
