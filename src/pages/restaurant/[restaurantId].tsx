import { UserIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import { useRouter } from "next/router";
import { useCallback } from "react";
import { Layout } from "../../components/layout";
import { trpc } from "../../utils/trpc";

export default function RestaurantById() {
  const { query } = useRouter<"/restaurant/[restaurantId]">();
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
  const { data: reviews } = trpc.yelp.reviews.useQuery(
    {
      id: restaurantId,
    },
    {
      enabled: restaurantId !== undefined,
      refetchOnWindowFocus: false,
    }
  );

  debugger;

  const maybeRenderBody = useCallback(() => {
    if (restaurant === undefined || reviews === undefined) {
      return <p>Loading...</p>;
    }

    return (
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-4 grid-rows-2 gap-4">
          <header className="col-span-2 row-start-1 space-y-4">
            <h1 className="semi-bold text-2xl">{restaurant.name}</h1>
            <address className="not-italic">
              <p>{restaurant.location.address1}</p>
              <p>
                {restaurant.location.city}, {restaurant.location.state}{" "}
                {restaurant.location.zipCode}
              </p>
            </address>
          </header>
          <div className="relative col-span-2 col-start-3 row-span-full">
            {restaurant.imageUrl === undefined ||
            restaurant.imageUrl === null ? (
              <div className="inset-0 bg-gray-500" />
            ) : (
              <Image
                src={restaurant.imageUrl}
                alt="Main image of the restaurant"
                objectFit="contain"
                objectPosition="top left"
                width={170}
                height={208}
              />
            )}
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
  }, [restaurant, reviews]);

  return <Layout>{maybeRenderBody()}</Layout>;
}
