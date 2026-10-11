import { UserIcon } from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import classNames from "classnames";
import Image from "next/image";
import { trpc } from "../../../utils/trpc";

interface IYelpReviewsProps {
  restaurantId: string;
  yelpUrl?: string;
}

// Yelp returns times like "2023-05-01 12:34:56" in the business's timezone
const formatReviewDate = (timeCreated: string) =>
  new Date(timeCreated.replace(" ", "T")).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

export const YelpReviews = ({ restaurantId, yelpUrl }: IYelpReviewsProps) => {
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

  const renderReviews = () => {
    if (isLoading || !yelpReviews) {
      return [1, 2, 3].map((key) => (
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
            <p className="h-6 w-2/6 animate-pulse rounded bg-gray-300" />
          </div>
          <p className="h-4 w-11/12 animate-pulse rounded bg-gray-300" />
          <p className="h-4 w-4/5 animate-pulse rounded bg-gray-300" />
          <p className="h-4 w-10/12 animate-pulse rounded bg-gray-300" />
          <p className="h-4 w-3/4 animate-pulse rounded bg-gray-300" />
        </li>
      ));
    }

    if (yelpReviews.reviews.length === 0) {
      return <p>No reviews found.</p>;
    }

    return yelpReviews.reviews.map((review) => (
      <li key={review.id} className="flex max-w-3xl gap-4">
        <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full">
          {review.user.imageUrl === undefined ||
          review.user.imageUrl === null ? (
            <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-600">
              <UserIcon className="block h-6 w-6 " aria-hidden />
            </div>
          ) : (
            <Image
              src={review.user.imageUrl}
              alt=""
              fill
              className="relative"
              style={{
                objectFit: "cover",
              }}
            />
          )}
        </div>
        <div className="min-w-0 flex-1 space-y-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="text-sm font-medium">{review.user.name}</p>
            <div
              className="flex"
              role="img"
              aria-label={`${review.rating} out of 5 stars`}
            >
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={classNames(
                    "h-4 w-4",
                    star <= review.rating ? "text-red-600" : "text-gray-300"
                  )}
                  aria-hidden
                />
              ))}
            </div>
            <p className="text-xs text-gray-500">
              {formatReviewDate(review.timeCreated)}
            </p>
          </div>
          <p className="text-sm leading-snug sm:text-base">{review.text}</p>
          <a
            href={review.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
          >
            Read on Yelp
          </a>
        </div>
      </li>
    ));
  };

  return (
    <section className="space-y-4">
      <header className="flex items-baseline justify-between">
        <h2 className="text-xl font-medium">Yelp Reviews</h2>
        {yelpUrl !== undefined && (
          <a
            href={yelpUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:underline"
          >
            See all on Yelp
          </a>
        )}
      </header>
      <ul className="space-y-6">{renderReviews()}</ul>
    </section>
  );
};
