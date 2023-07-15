import { UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { trpc } from "../../../utils/trpc";

interface IYelpReviewsProps {
  restaurantId: string;
}

export const YelpReviews = ({ restaurantId }: IYelpReviewsProps) => {
  const { data: yelpReviews, isLoading } = trpc.yelp.reviews.useQuery(
    { id: restaurantId },
    {
      enabled: restaurantId !== undefined,
      refetchOnWindowFocus: false,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    }
  );

  if (isLoading) {
    return (
      <section className="space-y-4">
        <h2 className="semi-bold text-xl font-medium">Yelp Reviews</h2>
        <ul className="space-y-6">
          {[1, 2, 3].map((key) => (
            <li key={key} className="space-y-2">
              <div className="flex items-center space-x-2 rounded-full">
                <div className="relative h-12 w-12 overflow-hidden rounded-full">
                  <div className="flex h-12 w-12 animate-pulse items-center justify-center rounded-full border-2 border-gray-300">
                    <UserIcon
                      className="block h-6 w-6 animate-pulse stroke-gray-300"
                      aria-hidden
                    />
                  </div>
                </div>
                <p className="semi-bold h-6 w-2/6 animate-pulse rounded bg-gray-300" />
              </div>
              <p className="h-4 w-11/12 animate-pulse rounded bg-gray-300" />
              <p className="h-4 w-4/5 animate-pulse rounded bg-gray-300" />
              <p className="h-4 w-10/12 animate-pulse rounded bg-gray-300" />
              <p className="h-4 w-3/4 animate-pulse rounded bg-gray-300" />
            </li>
          ))}
        </ul>
      </section>
    );
  }

  if (yelpReviews === undefined) {
    return null;
  }

  return (
    <section className="space-y-4">
      <h2 className="semi-bold text-xl font-medium">Yelp Reviews</h2>
      <ul className="space-y-6">
        {yelpReviews.reviews.map((review) => (
          <li key={review.id} className="space-y-2">
            <div className="flex items-center space-x-2 rounded-full">
              <div className="relative h-12 w-12 overflow-hidden rounded-full">
                {review.user.imageUrl === undefined ||
                review.user.imageUrl === null ? (
                  <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-600">
                    <UserIcon className="block h-6 w-6 " aria-hidden />
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
