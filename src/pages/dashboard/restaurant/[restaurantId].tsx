import { HeartIcon } from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { AddReviewModal } from "../../../components/addReviewModal";
import { Button } from "../../../components/button";
import { Layout } from "../../../components/layout";
import { FavoriteFoods } from "../../../components/modules/restaurantDetail/favoriteFoods";
import { YelpReviews } from "../../../components/modules/restaurantDetail/yelpReviews";
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
  const { data: restaurant, isLoading: isLoadingYelpRestaurant } =
    trpc.yelp.byId.useQuery(
      { id: restaurantId },
      { enabled: restaurantId !== undefined, refetchOnWindowFocus: false }
    );
  const { data: favoriteRestaurant, isLoading: isLoadingFavoriteRestaurant } =
    trpc.favoriteRestaurant.byId.useQuery(
      { id: restaurantId },
      { enabled: restaurant !== undefined }
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

  const isLoading = isLoadingYelpRestaurant || isLoadingFavoriteRestaurant;

  const maybeRenderBody = useCallback(() => {
    return (
      <>
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-4 grid-rows-2 gap-2">
            <header className="col-span-full row-start-1 space-y-4">
              {isLoading || restaurant === undefined ? (
                <div className="h-8 w-48 animate-pulse rounded bg-gray-300" />
              ) : (
                <h1 className="semi text-2xl">{restaurant.name}</h1>
              )}
            </header>
            <address className="col-span-2 row-start-2 not-italic">
              {isLoading || restaurant === undefined ? (
                <div className="space-y-1">
                  <div className="h-6 w-32 animate-pulse rounded bg-gray-300" />
                  <div className="h-6 w-36 animate-pulse rounded bg-gray-300" />
                </div>
              ) : (
                <>
                  <p>{restaurant.location.address1}</p>
                  <p>
                    {restaurant.location.city}, {restaurant.location.state}{" "}
                    {restaurant.location.zipCode}
                  </p>
                </>
              )}
            </address>
            <div className="col-span-2 col-start-4 row-start-2 flex h-full w-full items-center justify-end">
              <Button
                size="sm"
                color="primary"
                variant="ghost"
                disabled={isLoading}
                onClick={handleFavoriteClick}
                LeftIcon={
                  <HeartIcon
                    className={classNames(
                      "h-7 w-7 fill-none stroke-gray-300",
                      !isLoading && isFavorite && "fill-red-400 stroke-red-400"
                    )}
                  />
                }
              />
            </div>
          </div>
          <hr className="bg-gray-300" />
          <div className="space-y-8">
            {isFavorite && (
              <FavoriteFoods
                openModal={openModal}
                restaurantId={restaurantId}
              />
            )}
            <YelpReviews restaurantId={restaurantId} />
          </div>
        </div>
        <AddReviewModal
          isOpen={isAddReviewModalOpen}
          closeModal={closeModal}
          restaurantId={restaurantId}
        />
      </>
    );
  }, [
    restaurant,
    handleFavoriteClick,
    isFavorite,
    openModal,
    restaurantId,
    isAddReviewModalOpen,
    closeModal,
    isLoading,
  ]);

  return <Layout>{maybeRenderBody()}</Layout>;
}
