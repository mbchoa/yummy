import { Like } from "@prisma/client";
import { useSession } from "next-auth/react";
import { useMemo } from "react";
import { Layout } from "../../components/layout";
import { RestaurantsList } from "../../components/modules/dashboard/restaurantsList";
import { SearchWidget } from "../../components/searchWidget";
import { trpc } from "../../utils/trpc";

export default function Dashboard() {
  const { data: session } = useSession();
  const { data: favoriteRestaurants, isLoading: isLoadingFavoriteRestaurants } =
    trpc.favoriteRestaurant.all.useQuery(
      { like: Like.LIKE },
      { enabled: session !== undefined }
    );
  const { data: restaurants, isLoading: isLoadingYelpRestaurants } =
    trpc.yelp.byIds.useQuery(
      (favoriteRestaurants ?? []).map(
        (favoriteRestaurant) => favoriteRestaurant.restaurantId
      ),
      { enabled: favoriteRestaurants !== undefined }
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

  return (
    <Layout>
      <SearchWidget />
      <div className="space-y-6">
        <section className="space-y-4 px-4">
          <h1 className="text-2xl font-semibold">Favorites</h1>
          <RestaurantsList
            isLoading={isLoadingFavoriteRestaurants || isLoadingYelpRestaurants}
            restaurants={restaurantsGroupedByCity}
          />
        </section>
      </div>
    </Layout>
  );
}
