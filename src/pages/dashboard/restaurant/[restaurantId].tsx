import {
  HandThumbDownIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { Like } from "@prisma/client";
import classNames from "classnames";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { AddReviewModal } from "../../../components/addReviewModal";
import { Button } from "../../../components/button";
import { Layout } from "../../../components/layout";
import { FavoriteFoods } from "../../../components/modules/restaurantDetail/favoriteFoods";
import { YelpReviews } from "../../../components/modules/restaurantDetail/yelpReviews";
import { retryServerErrors } from "../../../utils/retryServerErrors";
import { trpc } from "../../../utils/trpc";

export default function RestaurantById() {
  // modal
  const [isAddReviewModalOpen, setIsAddReviewModalOpen] = useState(false);
  const closeModal = useCallback(() => {
    setIsAddReviewModalOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setIsAddReviewModalOpen(true);
  }, []);

  // data query
  const router = useRouter<"/dashboard/restaurant/[restaurantId]">();
  const { query } = router;
  const { restaurantId } = query;
  const {
    data: restaurant,
    isLoading: isLoadingYelpRestaurant,
    error: yelpRestaurantError,
  } = trpc.yelp.byId.useQuery(
    { id: restaurantId },
    {
      enabled: restaurantId !== undefined,
      refetchOnWindowFocus: false,
      retry: retryServerErrors,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  );
  const {
    data: savedRestaurant,
    isLoading: isLoadingSavedRestaurant,
    refetch,
  } = trpc.favoriteRestaurant.byId.useQuery(
    { id: restaurantId },
    {
      // also load it when Yelp no longer has the restaurant, so a saved one
      // can still be removed from the list
      enabled:
        restaurant !== undefined ||
        yelpRestaurantError?.data?.code === "NOT_FOUND",
      refetchOnWindowFocus: false,
      retry: false,
    },
  );

  // data mutation
  const { mutateAsync: addRestaurant, isLoading: isAddingRestaurant } =
    trpc.favoriteRestaurant.add.useMutation();
  const { mutateAsync: updateRestaurant, isLoading: isUpdatingRestaurant } =
    trpc.favoriteRestaurant.update.useMutation();
  // one rating change at a time, so a double-click can't send two requests
  const isSavingLike = isAddingRestaurant || isUpdatingRestaurant;
  const { mutateAsync: removeRestaurant, isLoading: isRemovingRestaurant } =
    trpc.favoriteRestaurant.remove.useMutation();
  const [isConfirmingRemove, setIsConfirmingRemove] = useState(false);

  const handleRemoveMissingRestaurant = useCallback(async () => {
    await removeRestaurant({ id: restaurantId });
    await router.push("/dashboard");
  }, [removeRestaurant, restaurantId, router]);
  const [like, setLike] = useState<Like>(Like.UNSELECTED);

  useEffect(() => {
    if (savedRestaurant) {
      setLike(savedRestaurant.like);
    }
  }, [savedRestaurant]);

  const handleDislikeClick = useCallback(async () => {
    if (like === Like.UNSELECTED) {
      await addRestaurant({
        id: restaurantId,
        like: Like.DISLIKE,
      });
      await refetch();
      setLike(Like.DISLIKE);
      return;
    }

    if (like === Like.DISLIKE) {
      await removeRestaurant({
        id: restaurantId,
      });
      await refetch();
      setLike(Like.UNSELECTED);
      return;
    }

    await updateRestaurant({
      id: restaurantId,
      like: Like.DISLIKE,
    });
    setLike(Like.DISLIKE);
  }, [
    addRestaurant,
    like,
    refetch,
    removeRestaurant,
    restaurantId,
    updateRestaurant,
  ]);

  const handleFavoriteClick = useCallback(async () => {
    if (like === Like.UNSELECTED) {
      await addRestaurant({
        id: restaurantId,
        like: Like.LIKE,
      });
      await refetch();
      setLike(Like.LIKE);
      return;
    }

    if (like === Like.LIKE) {
      await removeRestaurant({
        id: restaurantId,
      });
      await refetch();
      setLike(Like.UNSELECTED);
      return;
    }

    await updateRestaurant({
      id: restaurantId,
      like: Like.LIKE,
    });
    setLike(Like.LIKE);
  }, [
    addRestaurant,
    like,
    refetch,
    removeRestaurant,
    restaurantId,
    updateRestaurant,
  ]);

  const isLoading = isLoadingYelpRestaurant || isLoadingSavedRestaurant;

  const maybeRenderBody = useCallback(() => {
    if (yelpRestaurantError) {
      return (
        <div className="space-y-4 p-4">
          <h1 className="text-2xl font-medium">
            {yelpRestaurantError.data?.code === "NOT_FOUND"
              ? "Restaurant not found"
              : "Couldn't load this restaurant"}
          </h1>
          <p className="text-gray-600">
            {yelpRestaurantError.data?.code === "NOT_FOUND"
              ? "Yelp no longer has this restaurant. It may have closed or been removed."
              : "Something went wrong loading it from Yelp. Try again in a moment."}
          </p>
          {yelpRestaurantError.data?.code === "NOT_FOUND" &&
            savedRestaurant && (
              <div className="space-y-3 rounded border border-gray-300 p-4">
                {isConfirmingRemove ? (
                  <>
                    <p className="text-sm text-gray-700">
                      Remove it from your list, along with any dishes you logged
                      there? This can&apos;t be undone.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isLoading={isRemovingRestaurant}
                        onClick={handleRemoveMissingRestaurant}
                      >
                        Remove
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setIsConfirmingRemove(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-gray-700">
                      It&apos;s still saved in your list.
                    </p>
                    <Button
                      size="sm"
                      variant="outlined"
                      onClick={() => setIsConfirmingRemove(true)}
                    >
                      Remove from my list
                    </Button>
                  </>
                )}
              </div>
            )}
          <Link className="text-indigo-600 hover:underline" href="/dashboard">
            Back to dashboard
          </Link>
        </div>
      );
    }

    return (
      <>
        <div className="p-4">
          <div className="grid grid-cols-4 grid-rows-2 gap-2">
            <header className="col-span-full row-start-1 space-y-4">
              {isLoadingYelpRestaurant || restaurant === undefined ? (
                <div className="h-8 w-48 animate-pulse rounded bg-gray-300" />
              ) : (
                <h1 className="text-2xl font-medium">{restaurant.name}</h1>
              )}
            </header>
            <address className="col-span-2 row-start-2 not-italic">
              {isLoadingYelpRestaurant || restaurant === undefined ? (
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
            <div className="col-span-2 col-start-3 row-start-2 flex h-full w-full items-center justify-end gap-1">
              {!isLoading && (
                <span className="mr-1 hidden text-sm text-gray-500 sm:inline">
                  {like === Like.LIKE && "In your favorites"}
                  {like === Like.DISLIKE && "In your dislikes"}
                  {like === Like.UNSELECTED && "Not rated"}
                </span>
              )}
              <Button
                size="sm"
                color="primary"
                variant="ghost"
                disabled={isLoadingYelpRestaurant || isSavingLike}
                onClick={handleDislikeClick}
                ariaLabel="Dislike restaurant"
                ariaPressed={like === Like.DISLIKE}
                title={
                  like === Like.DISLIKE ? "Remove from dislikes" : "Dislike"
                }
                LeftIcon={
                  <HandThumbDownIcon
                    className={classNames(
                      "h-7 w-7",
                      isLoading
                        ? "fill-none stroke-gray-300"
                        : like === Like.DISLIKE
                          ? "fill-red-500 stroke-red-700"
                          : "fill-none stroke-gray-500",
                    )}
                  />
                }
              />
              <Button
                size="sm"
                color="primary"
                variant="ghost"
                disabled={isLoadingYelpRestaurant || isSavingLike}
                onClick={handleFavoriteClick}
                ariaLabel="Like restaurant"
                ariaPressed={like === Like.LIKE}
                title={like === Like.LIKE ? "Remove from favorites" : "Like"}
                LeftIcon={
                  <HandThumbUpIcon
                    className={classNames(
                      "h-7 w-7",
                      isLoading
                        ? "fill-none stroke-gray-300"
                        : like === Like.LIKE
                          ? "fill-green-500 stroke-green-700"
                          : "fill-none stroke-gray-500",
                    )}
                  />
                }
              />
            </div>
          </div>
          <hr className="my-6" />
          {like !== Like.UNSELECTED ? (
            <FavoriteFoods openModal={openModal} restaurantId={restaurantId} />
          ) : (
            !isLoading && (
              <section className="space-y-4">
                <h2 className="text-xl font-medium">Personal Reviews</h2>
                <p className="rounded border border-gray-300 p-4 text-sm text-gray-600">
                  Rate this restaurant with a thumbs up or down to save it to
                  your list. Then you can log the dishes you tried.
                </p>
              </section>
            )
          )}
          <hr className="my-8" />
          <YelpReviews restaurantId={restaurantId} yelpUrl={restaurant?.url} />
        </div>
        <AddReviewModal
          isOpen={isAddReviewModalOpen}
          closeModal={closeModal}
          restaurantId={restaurantId}
        />
      </>
    );
  }, [
    yelpRestaurantError,
    savedRestaurant,
    isConfirmingRemove,
    isRemovingRestaurant,
    handleRemoveMissingRestaurant,
    isLoadingYelpRestaurant,
    restaurant,
    handleDislikeClick,
    isLoading,
    isSavingLike,
    like,
    handleFavoriteClick,
    openModal,
    restaurantId,
    isAddReviewModalOpen,
    closeModal,
  ]);

  return <Layout>{maybeRenderBody()}</Layout>;
}
