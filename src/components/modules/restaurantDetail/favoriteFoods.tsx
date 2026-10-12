import {
  HandThumbDownIcon,
  HandThumbUpIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useCallback, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { Button } from "../../button";

interface IFavoriteFoodsProps {
  openModal: () => void;
  restaurantId: string;
}

export const FavoriteFoods = ({
  openModal,
  restaurantId,
}: IFavoriteFoodsProps) => {
  const { data: favoriteRestaurant, isLoading: isFavoriteRestaurantLoading } =
    trpc.favoriteRestaurant.byId.useQuery(
      { id: restaurantId },
      { enabled: !!restaurantId },
    );
  const {
    data: foodReviews,
    isLoading: isFoodReviewsLoading,
    refetch: refetchFoodReviews,
  } = trpc.foodReview.all.useQuery(
    { restaurantId: restaurantId },
    { enabled: !!restaurantId },
  );
  const isLoading = isFavoriteRestaurantLoading || isFoodReviewsLoading;
  const { mutateAsync: updateFoodReview, isLoading: isUpdatingFoodReview } =
    trpc.foodReview.update.useMutation();
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteDraft, setNoteDraft] = useState("");
  const { mutateAsync: removeFoodReview } =
    trpc.foodReview.remove.useMutation();

  const handleDislikeFoodReview = useCallback(
    (foodReviewId: string) => async () => {
      await updateFoodReview({
        id: foodReviewId,
        like: "DISLIKE",
      });
      await refetchFoodReviews();
    },
    [refetchFoodReviews, updateFoodReview],
  );

  const handleLikeFoodReview = useCallback(
    (foodReviewId: string) => async () => {
      await updateFoodReview({ id: foodReviewId, like: "LIKE" });
      await refetchFoodReviews();
    },
    [refetchFoodReviews, updateFoodReview],
  );

  const handleRemoveFoodReview = useCallback(
    (foodReviewId: string) => async () => {
      await removeFoodReview({ id: foodReviewId });
      await refetchFoodReviews();
    },
    [removeFoodReview, refetchFoodReviews],
  );

  const handleEditNote = useCallback(
    (foodReviewId: string, note: string | null) => () => {
      setEditingNoteId(foodReviewId);
      setNoteDraft(note ?? "");
    },
    [],
  );

  const handleCancelNote = useCallback(() => {
    setEditingNoteId(null);
  }, []);

  const handleNoteDraftChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNoteDraft(event.target.value);
    },
    [],
  );

  const handleSaveNote = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (editingNoteId === null) {
        return;
      }
      await updateFoodReview({ id: editingNoteId, review: noteDraft });
      await refetchFoodReviews();
      setEditingNoteId(null);
    },
    [editingNoteId, noteDraft, refetchFoodReviews, updateFoodReview],
  );

  const maybeRenderBody = useCallback(() => {
    if (isLoading) {
      return (
        <ul className="space-y-2">
          {[1, 2, 3, 4].map((key) => (
            <li key={key} className="flex items-center justify-between">
              <p className="h-6 w-40 animate-pulse rounded bg-gray-300" />
              <div className="flex items-center space-x-2">
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  LeftIcon={
                    <HandThumbDownIcon className="h-5 w-5 stroke-gray-400" />
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  LeftIcon={
                    <HandThumbUpIcon className="h-5 w-5 stroke-gray-400" />
                  }
                />
                <Button
                  size="sm"
                  variant="ghost"
                  disabled={isLoading}
                  LeftIcon={<TrashIcon className="h-5 w-5 stroke-gray-400" />}
                />
              </div>
            </li>
          ))}
        </ul>
      );
    }

    if (!favoriteRestaurant || foodReviews === undefined) {
      return <p>Unable to fetch your food reviews.</p>;
    }

    if (foodReviews.length === 0) {
      return (
        <p className="rounded border border-gray-300 p-4 text-sm text-gray-600">
          No dishes logged yet. Use Add to log what you ordered.
        </p>
      );
    }

    return (
      <ul className="space-y-2">
        {foodReviews.map((foodReview) => (
          <li
            key={foodReview.id}
            className="flex items-start justify-between gap-4"
          >
            <div className="min-w-0 flex-1">
              <p>{foodReview.restaurantItem.name}</p>
              {editingNoteId === foodReview.id ? (
                <form className="mt-1 space-y-2" onSubmit={handleSaveNote}>
                  <textarea
                    className="w-full rounded text-sm"
                    aria-label={`Note for ${foodReview.restaurantItem.name}`}
                    rows={3}
                    maxLength={500}
                    value={noteDraft}
                    onChange={handleNoteDraftChange}
                    autoFocus
                  />
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      type="submit"
                      isLoading={isUpdatingFoodReview}
                    >
                      Save
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      type="button"
                      onClick={handleCancelNote}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <div className="space-y-0.5">
                  {foodReview.review !== null && (
                    <p className="whitespace-pre-line text-sm text-gray-600">
                      {foodReview.review}
                    </p>
                  )}
                  <button
                    type="button"
                    className="text-xs text-indigo-600 hover:underline"
                    onClick={handleEditNote(foodReview.id, foodReview.review)}
                  >
                    {foodReview.review !== null ? "Edit note" : "Add note"}
                  </button>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                ariaLabel={`Dislike ${foodReview.restaurantItem.name}`}
                ariaPressed={foodReview.like === "DISLIKE"}
                title="Dislike"
                LeftIcon={
                  <HandThumbDownIcon
                    className={classNames(
                      "h-5 w-5 stroke-slate-600",
                      foodReview.like === "DISLIKE" && "fill-red-500",
                    )}
                  />
                }
                onClick={handleDislikeFoodReview(foodReview.id)}
              />
              <Button
                size="sm"
                variant="ghost"
                LeftIcon={
                  <HandThumbUpIcon
                    className={classNames(
                      "h-5 w-5 stroke-slate-600",
                      foodReview.like === "LIKE" && "fill-green-500",
                    )}
                  />
                }
                ariaLabel={`Like ${foodReview.restaurantItem.name}`}
                ariaPressed={foodReview.like === "LIKE"}
                title="Like"
                onClick={handleLikeFoodReview(foodReview.id)}
              />
              <Button
                size="sm"
                LeftIcon={<TrashIcon className="h-4 w-4 stroke-red-400" />}
                variant="ghost"
                ariaLabel={`Remove ${foodReview.restaurantItem.name}`}
                title="Remove"
                onClick={handleRemoveFoodReview(foodReview.id)}
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }, [
    favoriteRestaurant,
    foodReviews,
    handleDislikeFoodReview,
    handleLikeFoodReview,
    handleRemoveFoodReview,
    isLoading,
    editingNoteId,
    noteDraft,
    isUpdatingFoodReview,
    handleSaveNote,
    handleNoteDraftChange,
    handleCancelNote,
    handleEditNote,
  ]);

  return (
    <section className="space-y-4">
      <header className="flex justify-between">
        <h2 className="text-xl font-medium">Personal Reviews</h2>
        <Button size="sm" onClick={openModal}>
          Add
        </Button>
      </header>
      {maybeRenderBody()}
    </section>
  );
};
