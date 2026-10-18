import {
  BookmarkIcon,
  HandThumbDownIcon,
  HandThumbUpIcon,
} from "@heroicons/react/24/outline";
import { Like } from "@prisma/client";
import classNames from "classnames";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";
import { AddReviewModal } from "../../../components/addReviewModal";
import { Button } from "../../../components/button";
import { Layout } from "../../../components/layout";
import { FavoriteFoods } from "../../../components/modules/restaurantDetail/favoriteFoods";
import {
  RestaurantInfo,
  RestaurantInfoSkeleton,
} from "../../../components/modules/restaurantDetail/restaurantInfo";
import { RestaurantNote } from "../../../components/modules/restaurantDetail/restaurantNote";
import { showToast } from "../../../components/toast";
import { YelpReviews } from "../../../components/modules/restaurantDetail/yelpReviews";
import { requireAuth } from "../../../server/common/require-auth";
import { retryServerErrors } from "../../../utils/retryServerErrors";
import { trpc } from "../../../utils/trpc";

// keyed by restaurant, so moving between restaurants (e.g. from search) starts
// with fresh state instead of the previous restaurant's rating and forms
type SavedLike = Exclude<Like, typeof Like.UNSELECTED>;

const STATE_LABELS: Record<Like, string> = {
  [Like.LIKE]: "Liked",
  [Like.DISLIKE]: "Disliked",
  [Like.WANT_TO_TRY]: "Want to try",
  [Like.UNSELECTED]: "Not saved",
};

const SAVE_BUTTONS = [
  {
    like: Like.WANT_TO_TRY,
    label: "Save to try",
    Icon: BookmarkIcon,
    filled: "fill-indigo-500 stroke-indigo-700",
  },
  {
    like: Like.DISLIKE,
    label: "Dislike restaurant",
    Icon: HandThumbDownIcon,
    filled: "fill-red-500 stroke-red-700",
  },
  {
    like: Like.LIKE,
    label: "Like restaurant",
    Icon: HandThumbUpIcon,
    filled: "fill-green-500 stroke-green-700",
  },
] as const;

export default function RestaurantById() {
  const { query } = useRouter<"/dashboard/restaurant/[restaurantId]">();
  return <RestaurantDetail key={query.restaurantId} />;
}

function RestaurantDetail() {
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
  // viewers can see a shared list but not change it; until this loads, the
  // controls stay hidden
  const { data: listAccess } = trpc.userSetting.access.useQuery();
  const canEdit = listAccess?.canEdit === true;

  // data mutation
  const { mutateAsync: addRestaurant, isLoading: isAddingRestaurant } =
    trpc.favoriteRestaurant.add.useMutation();
  const { mutateAsync: removeRestaurant, isLoading: isRemovingRestaurant } =
    trpc.favoriteRestaurant.remove.useMutation();
  // one change at a time, so a double-click can't send two requests
  const isSavingLike = isAddingRestaurant || isRemovingRestaurant;

  const utils = trpc.useContext();
  const [like, setLike] = useState<Like>(Like.UNSELECTED);

  // follow the server once it has answered, including when the restaurant
  // isn't saved (null), so a stale rating can't outlive a removal
  useEffect(() => {
    if (savedRestaurant !== undefined) {
      setLike(savedRestaurant?.like ?? Like.UNSELECTED);
    }
  }, [savedRestaurant]);

  const saveAs = useCallback(
    async (nextLike: SavedLike) => {
      await addRestaurant({ id: restaurantId, like: nextLike });
      await refetch();
      setLike(nextLike);
    },
    [addRestaurant, refetch, restaurantId],
  );

  // removing only hides the restaurant, so its dishes and note come back if
  // it's saved again, and undo is just saving it again
  const handleRemove = useCallback(
    async (previousLike: SavedLike) => {
      await removeRestaurant({ id: restaurantId });
      utils.favoriteRestaurant.byId.setData({ id: restaurantId }, null);
      setLike(Like.UNSELECTED);
      showToast("Removed from your list.", {
        label: "Undo",
        onClick: () => saveAs(previousLike),
      });
    },
    [removeRestaurant, restaurantId, saveAs, utils],
  );

  // tapping the selected state again takes the restaurant off the list
  const handleSelect = useCallback(
    async (nextLike: SavedLike) => {
      if (like === nextLike) {
        await handleRemove(nextLike);
        return;
      }
      await saveAs(nextLike);
    },
    [handleRemove, like, saveAs],
  );

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
            savedRestaurant &&
            canEdit && (
              <div className="space-y-3 rounded border border-gray-300 p-4">
                <p className="text-sm text-gray-700">
                  It&apos;s still saved in your list.
                </p>
                <Button
                  size="sm"
                  variant="outlined"
                  isLoading={isRemovingRestaurant}
                  onClick={() =>
                    handleRemove(savedRestaurant.like as SavedLike)
                  }
                >
                  Remove from my list
                </Button>
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
          {isLoadingYelpRestaurant || restaurant === undefined ? (
            <div className="mb-4 h-48 animate-pulse rounded-xl bg-gray-200 sm:h-64" />
          ) : (
            restaurant.imageUrl && (
              <div className="relative mb-4 h-48 overflow-hidden rounded-xl bg-gray-200 sm:h-64">
                <Image
                  src={restaurant.imageUrl}
                  alt=""
                  fill
                  priority
                  sizes="(min-width: 1024px) 1024px, 100vw"
                  className="object-cover"
                />
              </div>
            )
          )}
          {/* on phones the save buttons get their own row, so the name keeps the
          width */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
            <header className="min-w-0 flex-1 space-y-2">
              {isLoadingYelpRestaurant || restaurant === undefined ? (
                <>
                  <div className="h-8 w-48 animate-pulse rounded bg-gray-300" />
                  <RestaurantInfoSkeleton />
                </>
              ) : (
                <>
                  <h1 className="text-2xl font-medium">{restaurant.name}</h1>
                  <RestaurantInfo restaurant={restaurant} />
                </>
              )}
            </header>
            <div className="-ml-2 flex shrink-0 items-center gap-1 sm:ml-0">
              {!isLoading && (
                <span className="order-last ml-1 text-sm text-gray-500 sm:order-first sm:ml-0 sm:mr-1">
                  {STATE_LABELS[like]}
                </span>
              )}
              {SAVE_BUTTONS.map(({ like: buttonLike, label, Icon, filled }) => (
                <Button
                  key={buttonLike}
                  size="sm"
                  color="primary"
                  variant="ghost"
                  disabled={isLoadingYelpRestaurant || isSavingLike || !canEdit}
                  onClick={() => handleSelect(buttonLike)}
                  ariaLabel={label}
                  ariaPressed={like === buttonLike}
                  title={
                    like === buttonLike
                      ? `${STATE_LABELS[buttonLike]}. Tap again to remove from your list`
                      : label
                  }
                  LeftIcon={
                    <Icon
                      className={classNames(
                        "h-7 w-7",
                        isLoading
                          ? "fill-none stroke-gray-300"
                          : like === buttonLike
                            ? filled
                            : "fill-none stroke-gray-500",
                      )}
                    />
                  }
                />
              ))}
            </div>
          </div>
          {listAccess !== undefined && !canEdit && (
            <p className="mt-4 rounded bg-gray-100 px-3 py-2 text-sm text-gray-600">
              You can view this list but not change it.
            </p>
          )}
          <hr className="my-6" />
          {like !== Like.UNSELECTED ? (
            <>
              {savedRestaurant && (
                <section className="mb-6 space-y-2">
                  <h2 className="text-xl font-medium">Note</h2>
                  <RestaurantNote
                    restaurantId={restaurantId}
                    note={savedRestaurant.note}
                    canEdit={canEdit}
                    onSaved={refetch}
                  />
                </section>
              )}
              <FavoriteFoods
                openModal={openModal}
                restaurantId={restaurantId}
                canEdit={canEdit}
              />
            </>
          ) : (
            !isLoading && (
              <section className="space-y-4">
                <h2 className="text-xl font-medium">Personal Reviews</h2>
                <p className="rounded border border-gray-300 p-4 text-sm text-gray-600">
                  {canEdit
                    ? "Been here? Rate it 👍 or 👎. Haven't yet? Tap 🔖 to save it to try. Then you can add a note and log dishes."
                    : "This restaurant isn't on this list."}
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
    isRemovingRestaurant,
    handleRemove,
    isLoadingYelpRestaurant,
    restaurant,
    handleSelect,
    refetch,
    isLoading,
    isSavingLike,
    like,
    listAccess,
    canEdit,
    openModal,
    restaurantId,
    isAddReviewModalOpen,
    closeModal,
  ]);

  return <Layout>{maybeRenderBody()}</Layout>;
}

export const getServerSideProps = requireAuth;
