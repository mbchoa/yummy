import {
  HeartIcon,
  PlusCircleIcon,
  UserIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { AddReviewModal } from "../../../components/addReviewModal";
import { Button } from "../../../components/button";
import { Layout } from "../../../components/layout";
import { trpc } from "../../../utils/trpc";

export default function RestaurantById() {
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const closeModal = useCallback(() => {
    setIsAddReviewModalOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setIsAddReviewModalOpen(true);
  }, []);

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
      return <p className="px-4">Loading...</p>;
    }

    return (
      <>
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
                        : "fill-none stroke-gray-300"
                    )}
                  />
                }
              />
            </div>
          </div>
          <hr className="bg-gray-300" />
          <div className="space-y-8">
            {isFavorite && (
              <section className="space-y-4">
                <h2 className="semi-bold text-xl">Favorite Foods</h2>
                <div className="flex w-full flex-col items-center justify-center space-y-2 rounded border border-gray-300 p-4">
                  <Button
                    size="sm"
                    color="primary"
                    variant="ghost"
                    LeftIcon={
                      <PlusCircleIcon className="h-8 w-8 stroke-gray-300" />
                    }
                    onClick={openModal}
                  />
                  <p className="text-sm">Add an item!</p>
                </div>
              </section>
            )}
            <section className="space-y-4">
              <h2 className="semi-bold text-xl">Reviews</h2>
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
            </section>
          </div>
        </div>
        <AddReviewModal isOpen={isAddReviewModalOpen} closeModal={closeModal} />
      </>
    );
  }, [
    restaurant,
    reviews,
    isFavorite,
    handleFavoriteClick,
    isAddReviewModalOpen,
    closeModal,
    openModal,
  ]);

  return <Layout>{maybeRenderBody()}</Layout>;
}
