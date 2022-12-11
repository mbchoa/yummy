import { HeartIcon, UserIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { Button } from "../../../components/button";
import { Layout } from "../../../components/layout";
import { trpc } from "../../../utils/trpc";

export default function RestaurantById() {
  const { query } = useRouter<"/dashboard/restaurant/[restaurantId]">();
  const { restaurantId } = query;
  const { data: restaurant } = trpc.yelp.byId.useQuery(
    {
      id: restaurantId,
    },
    {
      enabled: restaurantId !== undefined,
      refetchOnWindowFocus: false,
    }
  );
  const { data: favoriteRestaurant } = trpc.favoriteRestaurant.byId.useQuery(
    {
      id: restaurantId,
    },
    {
      enabled: restaurantId !== undefined,
    }
  );
  const { data: reviews } = trpc.yelp.reviews.useQuery(
    {
      id: restaurantId,
    },
    {
      enabled: restaurantId !== undefined,
      refetchOnWindowFocus: false,
    }
  );
  const { mutateAsync: addRestaurant } =
    trpc.favoriteRestaurant.add.useMutation();
  const { mutateAsync: removeRestaurant } =
    trpc.favoriteRestaurant.remove.useMutation();
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (favoriteRestaurant !== undefined) {
      setIsFavorite(true);
    }
  }, [favoriteRestaurant]);

  const handleFavoriteClick = useCallback(async () => {
    if (isFavorite) {
      await removeRestaurant({ id: restaurantId });
    } else {
      await addRestaurant({ id: restaurantId });
    }
    setIsFavorite(!isFavorite);
  }, [addRestaurant, isFavorite, removeRestaurant, restaurantId]);

  const maybeRenderBody = useCallback(() => {
    if (restaurant === undefined || reviews === undefined) {
      return <p>Loading...</p>;
    }

    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-4 grid-rows-2 gap-2">
          <header className="col-span-full row-start-1 space-y-4">
            <h1 className="semi-bold text-2xl">{restaurant.name}</h1>
          </header>
          <address className="col-span-2 row-start-2 not-italic">
            <p>{restaurant.location.address1}</p>
            <p>
              {restaurant.location.city}, {restaurant.location.state}{" "}
              {restaurant.location.zipCode}
            </p>
          </address>
          <div className="col-span-2 col-start-4 row-start-2 flex h-full w-full items-center justify-end">
            <Button
              size="sm"
              color="primary"
              variant="ghost"
              onClick={handleFavoriteClick}
              LeftIcon={
                <HeartIcon
                  className={classNames(
                    "h-7 w-7",
                    isFavorite
                      ? "fill-red-400 stroke-red-400"
                      : "fill-none stroke-gray-400"
                  )}
                />
              }
            />
          </div>
        </div>
        <hr className="bg-gray-500" />
        <ul className="space-y-6">
          {reviews.reviews.map((review) => (
            <li key={review.id} className="space-y-2">
              <div className="flex items-center space-x-2 rounded-full">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  {review.user.imageUrl === undefined ||
                  review.user.imageUrl === null ? (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-600">
                      <UserIcon className="block h-6 w-6" aria-hidden />
                    </div>
                  ) : (
                    <Image
                      src={review.user.imageUrl}
                      alt={review.user.name}
                      fill
                      className="relative"
                      objectFit="cover"
                    />
                  )}
                </div>
                <p className="semi-bold">{review.user.name}</p>
              </div>
              <p>{review.text}</p>
            </li>
          ))}
        </ul>
      </div>
    );
  }, [restaurant, reviews, isFavorite, handleFavoriteClick]);

  return <Layout>{maybeRenderBody()}</Layout>;
}
