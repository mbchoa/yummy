import { UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { trpc } from "../../../utils/trpc";

interface IYelpReviewsProps {
  restaurantId: string;
}

export const YelpReviews = ({ restaurantId }: IYelpReviewsProps) => {
  const { data: yelpReviews } = trpc.yelp.reviews.useQuery(
    { id: restaurantId },
    { enabled: restaurantId !== undefined, refetchOnWindowFocus: false }
  );

  if (yelpReviews === undefined) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="semi-bold text-xl">Reviews</h2>
      <ul className="space-y-6">
        {yelpReviews.reviews.map((review) => (
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
                    style={{
                      objectFit: "cover",
                    }}
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
  );
};
