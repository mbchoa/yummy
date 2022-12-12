import {
  HandThumbDownIcon,
  HandThumbUpIcon,
  PlusCircleIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";
import classNames from "classnames";
import { useCallback } from "react";
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
      {
        id: restaurantId,
      },
      {
        enabled: restaurantId !== undefined,
      }
    );
  const { data: foodReviews, isLoading: isFoodReviewsLoading } =
    trpc.foodReview.all.useQuery(
      { restaurantId },
      { enabled: favoriteRestaurant !== undefined }
    );

  const maybeRenderBody = useCallback(() => {
    if (isFavoriteRestaurantLoading || isFoodReviewsLoading) {
      return <p>Loading...</p>;
    }

    if (favoriteRestaurant === undefined || foodReviews === undefined) {
      return <p>Unable to fetch your food reviews.</p>;
    }

    if (foodReviews.length === 0) {
      return (
        <div className="flex w-full flex-col items-center justify-center space-y-2 rounded border border-gray-300 p-4">
          <Button
            size="sm"
            color="primary"
            variant="ghost"
            LeftIcon={<PlusCircleIcon className="h-8 w-8 stroke-gray-300" />}
            onClick={openModal}
          />
          <p className="text-sm">Add an item!</p>
        </div>
      );
    }

    return (
      <ul className="space-y-2">
        {foodReviews.map((foodReview) => (
          <li key={foodReview.id} className="flex items-center justify-between">
            <p>{foodReview.name}</p>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                LeftIcon={
                  <HandThumbDownIcon
                    className={classNames(
                      "h-5 w-5",
                      foodReview.like === "DISLIKE" &&
                        "fill-red-400 stroke-red-400"
                    )}
                  />
                }
              />
              <Button
                size="sm"
                variant="ghost"
                LeftIcon={
                  <HandThumbUpIcon
                    className={classNames(
                      "h-5 w-5",
                      foodReview.like === "LIKE" &&
                        "fill-green-400 stroke-green-400"
                    )}
                  />
                }
              />
              <Button
                size="sm"
                LeftIcon={<TrashIcon className="h-4 w-4 stroke-red-400" />}
                variant="ghost"
              />
            </div>
          </li>
        ))}
      </ul>
    );
  }, [
    favoriteRestaurant,
    foodReviews,
    isFavoriteRestaurantLoading,
    isFoodReviewsLoading,
    openModal,
  ]);

  return (
    <section className="space-y-4">
      <h2 className="semi-bold text-xl">Favorite Foods</h2>
      {maybeRenderBody()}
    </section>
  );
};
