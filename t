[33m[0m[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[33mmodified: .vscode/settings.json
[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[35m[35m@ .vscode/settings.json:22 @[1m[0m
    "**/.git": true,[m
    "**/.svn": true,[m
    "**/.hg": true,[m
[32m[32m[m[32m    "**/node_modules": true,[m[0m
    "**/CVS": true,[m
    "**/.DS_Store": true[m
  },[m
[33m[0m[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[33mmodified: nextjs-routes.d.ts
[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[35m[35m@ nextjs-routes.d.ts:14 @[1m[1m[38;5;146m declare module "nextjs-routes" {[0m
    | StaticRoute<"/api/trpc/playground">[m
    | StaticRoute<"/dashboard">[m
    | DynamicRoute<"/dashboard/restaurant/[restaurantId]", { "restaurantId": string }>[m
[31m[31m    | StaticRoute<"/">[m[0m
[31m[31m    | DynamicRoute<"/restaurant/[restaurantId]", { "restaurantId": string }>;[m[0m
[32m[32m[m[32m    | StaticRoute<"/">;[m[0m
[m
  interface StaticRoute<Pathname> {[m
    pathname: Pathname;[m
[33m[0m[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[33mmodified: src/components/searchWidget.tsx
[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[35m[35m@ src/components/searchWidget.tsx:46 @[1m[1m[38;5;146m export const SearchWidget = () => {[0m
            <li key={business.id}>[m
              <Link[m
                href={{[m
[31m[1;31m                  pathname: "/[m[1;31;48;5;52m[m[1;31mrestaurant/[restaurantId]",[m[0m
[32m[1;32m                  pathname: "/[m[1;32;48;5;22mdashboard/[m[1;32mrestaurant/[restaurantId]",[m[0m
                  query: { restaurantId: business.id },[m
                }}[m
              >[m
[33m[0m[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[33mmodified: src/pages/dashboard/restaurant/[restaurantId].tsx
[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[35m[35m@ src/pages/dashboard/restaurant/[restaurantId].tsx:4 @[1m[0m
[32m[32m[m[32mimport { HeartIcon, UserIcon } from "@heroicons/react/24/outline";[m[0m
[32m[32m[m[32mimport classNames from "classnames";[m[0m
[32m[32m[m[32mimport Image from "next/image";[m[0m
import { useRouter } from "next/router";[m
[31m[31mimport { useCallback } from "react";[m[0m
[32m[32m[m[32mimport { useCallback, useEffect, useState } from "react";[m[0m
[32m[32m[m[32mimport { Button } from "../../../components/button";[m[0m
import { Layout } from "../../../components/layout";[m
import { trpc } from "../../../utils/trpc";[m
[m
[31m[1;31mexport default function [m[1;31;48;5;52mFavorite[m[1;31mRestaurantById() {[m[0m
[32m[1;32mexport default function [m[1;32;48;5;22m[m[1;32mRestaurantById() {[m[0m
  const { query } = useRouter<"/dashboard/restaurant/[restaurantId]">();[m
  const { restaurantId } = query;[m
  const { data: restaurant } = trpc.yelp.byId.useQuery([m
[31m[31m    { id: restaurantId },[m[0m
[31m[31m    { enabled: restaurantId !== undefined, refetchOnWindowFocus: false }[m[0m
[32m[32m[m[32m    {[m[0m
[32m[32m[m[32m      id: restaurantId,[m[0m
[32m[32m[m[32m    },[m[0m
[32m[32m[m[32m    {[m[0m
[32m[32m[m[32m      enabled: restaurantId !== undefined,[m[0m
[32m[32m[m[32m      refetchOnWindowFocus: false,[m[0m
[32m[32m[m[32m    }[m[0m
[32m[32m[m[32m  );[m[0m
[32m[32m[m[32m  const { data: favoriteRestaurant } = trpc.favoriteRestaurant.byId.useQuery([m[0m
[32m[32m[m[32m    {[m[0m
[32m[32m[m[32m      id: restaurantId,[m[0m
[32m[32m[m[32m    },[m[0m
[32m[32m[m[32m    {[m[0m
[32m[32m[m[32m      enabled: restaurantId !== undefined,[m[0m
[32m[32m[m[32m    }[m[0m
[32m[32m[m[32m  );[m[0m
[32m[32m[m[32m  const { data: reviews } = trpc.yelp.reviews.useQuery([m[0m
[32m[32m[m[32m    {[m[0m
[32m[32m[m[32m      id: restaurantId,[m[0m
[32m[32m[m[32m    },[m[0m
[32m[32m[m[32m    {[m[0m
[32m[32m[m[32m      enabled: restaurantId !== undefined,[m[0m
[32m[32m[m[32m      refetchOnWindowFocus: false,[m[0m
[32m[32m[m[32m    }[m[0m
  );[m
[32m[32m[m[32m  const { mutateAsync: addRestaurant } =[m[0m
[32m[32m[m[32m    trpc.favoriteRestaurant.add.useMutation();[m[0m
[32m[32m[m[32m  const { mutateAsync: removeRestaurant } =[m[0m
[32m[32m[m[32m    trpc.favoriteRestaurant.remove.useMutation();[m[0m
[32m[32m[m[32m  const [isFavorite, setIsFavorite] = useState(false);[m[0m
[7m[32m [m
[32m[32m[m[32m  useEffect(() => {[m[0m
[32m[32m[m[32m    if (favoriteRestaurant !== undefined) {[m[0m
[32m[32m[m[32m      setIsFavorite(true);[m[0m
[32m[32m[m[32m    }[m[0m
[32m[32m[m[32m  }, [favoriteRestaurant]);[m[0m
[7m[32m [m
[32m[32m[m[32m  const handleFavoriteClick = useCallback(async () => {[m[0m
[32m[32m[m[32m    if (isFavorite) {[m[0m
[32m[32m[m[32m      await removeRestaurant({ id: restaurantId });[m[0m
[32m[32m[m[32m    } else {[m[0m
[32m[32m[m[32m      await addRestaurant({ id: restaurantId });[m[0m
[32m[32m[m[32m    }[m[0m
[32m[32m[m[32m    setIsFavorite(!isFavorite);[m[0m
[32m[32m[m[32m  }, [addRestaurant, isFavorite, removeRestaurant, restaurantId]);[m[0m
[m
  const maybeRenderBody = useCallback(() => {[m
[31m[1;31m    if (restaurant === undefined[m[1;31;48;5;52m[m[1;31m) {[m[0m
[32m[1;32m    if (restaurant === undefined[m[1;32;48;5;22m || reviews === undefined[m[1;32m) {[m[0m
      return <p>Loading...</p>;[m
    }[m
[m
    return ([m
[31m[31m      <>[m[0m
[31m[31m        <h1>{restaurant.name}</h1>[m[0m
[31m[31m        <p>{restaurant.location.address1}</p>[m[0m
[31m[31m        <p>[m[0m
[31m[31m          {restaurant.location.city}, {restaurant.location.state}{" "}[m[0m
[31m[31m          {restaurant.location.zipCode}[m[0m
[31m[31m        </p>[m[0m
[31m[31m      </>[m[0m
[32m[32m[m[32m      <div className="space-y-4 p-4">[m[0m
[32m[32m[m[32m        <div className="grid grid-cols-4 grid-rows-2 gap-2">[m[0m
[32m[32m[m[32m          <header className="col-span-full row-start-1 space-y-4">[m[0m
[32m[32m[m[32m            <h1 className="semi-bold text-2xl">{restaurant.name}</h1>[m[0m
[32m[32m[m[32m          </header>[m[0m
[32m[32m[m[32m          <address className="col-span-2 row-start-2 not-italic">[m[0m
[32m[32m[m[32m            <p>{restaurant.location.address1}</p>[m[0m
[32m[32m[m[32m            <p>[m[0m
[32m[32m[m[32m              {restaurant.location.city}, {restaurant.location.state}{" "}[m[0m
[32m[32m[m[32m              {restaurant.location.zipCode}[m[0m
[32m[32m[m[32m            </p>[m[0m
[32m[32m[m[32m          </address>[m[0m
[32m[32m[m[32m          <div className="col-span-2 col-start-4 row-start-2 flex h-full w-full items-center justify-end">[m[0m
[32m[32m[m[32m            <Button[m[0m
[32m[32m[m[32m              size="sm"[m[0m
[32m[32m[m[32m              color="primary"[m[0m
[32m[32m[m[32m              variant="ghost"[m[0m
[32m[32m[m[32m              onClick={handleFavoriteClick}[m[0m
[32m[32m[m[32m              LeftIcon={[m[0m
[32m[32m[m[32m                <HeartIcon[m[0m
[32m[32m[m[32m                  className={classNames([m[0m
[32m[32m[m[32m                    "h-7 w-7",[m[0m
[32m[32m[m[32m                    isFavorite[m[0m
[32m[32m[m[32m                      ? "fill-red-400 stroke-red-400"[m[0m
[32m[32m[m[32m                      : "fill-none stroke-gray-400"[m[0m
[32m[32m[m[32m                  )}[m[0m
[32m[32m[m[32m                />[m[0m
[32m[32m[m[32m              }[m[0m
[32m[32m[m[32m            />[m[0m
[32m[32m[m[32m          </div>[m[0m
[32m[32m[m[32m        </div>[m[0m
[32m[32m[m[32m        <hr className="bg-gray-500" />[m[0m
[32m[32m[m[32m        <ul className="space-y-6">[m[0m
[32m[32m[m[32m          {reviews.reviews.map((review) => ([m[0m
[32m[32m[m[32m            <li key={review.id} className="space-y-2">[m[0m
[32m[32m[m[32m              <div className="flex items-center space-x-2 rounded-full">[m[0m
[32m[32m[m[32m                <div className="relative h-12 w-12 overflow-hidden rounded-full">[m[0m
[32m[32m[m[32m                  {review.user.imageUrl === undefined ||[m[0m
[32m[32m[m[32m                  review.user.imageUrl === null ? ([m[0m
[32m[32m[m[32m                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-600">[m[0m
[32m[32m[m[32m                      <UserIcon className="block h-6 w-6" aria-hidden />[m[0m
[32m[32m[m[32m                    </div>[m[0m
[32m[32m[m[32m                  ) : ([m[0m
[32m[32m[m[32m                    <Image[m[0m
[32m[32m[m[32m                      src={review.user.imageUrl}[m[0m
[32m[32m[m[32m                      alt={review.user.name}[m[0m
[32m[32m[m[32m                      fill[m[0m
[32m[32m[m[32m                      className="relative"[m[0m
[32m[32m[m[32m                      objectFit="cover"[m[0m
[32m[32m[m[32m                    />[m[0m
[32m[32m[m[32m                  )}[m[0m
[32m[32m[m[32m                </div>[m[0m
[32m[32m[m[32m                <p className="semi-bold">{review.user.name}</p>[m[0m
[32m[32m[m[32m              </div>[m[0m
[32m[32m[m[32m              <p>{review.text}</p>[m[0m
[32m[32m[m[32m            </li>[m[0m
[32m[32m[m[32m          ))}[m[0m
[32m[32m[m[32m        </ul>[m[0m
[32m[32m[m[32m      </div>[m[0m
    );[m
[31m[1;31m  }, [restaurant[m[1;31;48;5;52m[m[1;31m]);[m[0m
[32m[1;32m  }, [restaurant[m[1;32;48;5;22m, reviews, isFavorite, handleFavoriteClick[m[1;32m]);[m[0m
[m
  return <Layout>{maybeRenderBody()}</Layout>;[m
}[m
[33m[0m[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[33mdeleted: [1;31;48;5;52msrc/pages/restaurant/[restaurantId].tsx[0m
[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[35m[35m@ src/pages/restaurant/[restaurantId].tsx:1 @[1m[0m
[31m[31mimport { HeartIcon, UserIcon } from "@heroicons/react/24/outline";[m[0m
[31m[31mimport classNames from "classnames";[m[0m
[31m[31mimport Image from "next/image";[m[0m
[31m[31mimport { useRouter } from "next/router";[m[0m
[31m[31mimport { useCallback, useState } from "react";[m[0m
[31m[31mimport { Button } from "../../components/button";[m[0m
[31m[31mimport { Layout } from "../../components/layout";[m[0m
[31m[31mimport { trpc } from "../../utils/trpc";[m[0m
[7m[31m [m
[31m[31mexport default function RestaurantById() {[m[0m
[31m[31m  const { query } = useRouter<"/restaurant/[restaurantId]">();[m[0m
[31m[31m  const { restaurantId } = query;[m[0m
[31m[31m  const { data: restaurant } = trpc.yelp.byId.useQuery([m[0m
[31m[31m    {[m[0m
[31m[31m      id: restaurantId,[m[0m
[31m[31m    },[m[0m
[31m[31m    {[m[0m
[31m[31m      enabled: restaurantId !== undefined,[m[0m
[31m[31m      refetchOnWindowFocus: false,[m[0m
[31m[31m    }[m[0m
[31m[31m  );[m[0m
[31m[31m  const { data: reviews } = trpc.yelp.reviews.useQuery([m[0m
[31m[31m    {[m[0m
[31m[31m      id: restaurantId,[m[0m
[31m[31m    },[m[0m
[31m[31m    {[m[0m
[31m[31m      enabled: restaurantId !== undefined,[m[0m
[31m[31m      refetchOnWindowFocus: false,[m[0m
[31m[31m    }[m[0m
[31m[31m  );[m[0m
[31m[31m  const [isFavorite, setIsFavorite] = useState(false);[m[0m
[7m[31m [m
[31m[31m  const handleFavoriteClick = useCallback(() => {[m[0m
[31m[31m    setIsFavorite(!isFavorite);[m[0m
[31m[31m  }, [isFavorite]);[m[0m
[7m[31m [m
[31m[31m  const maybeRenderBody = useCallback(() => {[m[0m
[31m[31m    if (restaurant === undefined || reviews === undefined) {[m[0m
[31m[31m      return <p>Loading...</p>;[m[0m
[31m[31m    }[m[0m
[7m[31m [m
[31m[31m    return ([m[0m
[31m[31m      <div className="space-y-4 p-4">[m[0m
[31m[31m        <div className="grid grid-cols-4 grid-rows-2 gap-2">[m[0m
[31m[31m          <header className="col-span-full row-start-1 space-y-4">[m[0m
[31m[31m            <h1 className="semi-bold text-2xl">{restaurant.name}</h1>[m[0m
[31m[31m          </header>[m[0m
[31m[31m          <address className="col-span-2 row-start-2 not-italic">[m[0m
[31m[31m            <p>{restaurant.location.address1}</p>[m[0m
[31m[31m            <p>[m[0m
[31m[31m              {restaurant.location.city}, {restaurant.location.state}{" "}[m[0m
[31m[31m              {restaurant.location.zipCode}[m[0m
[31m[31m            </p>[m[0m
[31m[31m          </address>[m[0m
[31m[31m          <div className="col-span-2 col-start-4 row-start-2 flex h-full w-full items-center justify-end">[m[0m
[31m[31m            <Button[m[0m
[31m[31m              size="sm"[m[0m
[31m[31m              color="primary"[m[0m
[31m[31m              variant="ghost"[m[0m
[31m[31m              onClick={handleFavoriteClick}[m[0m
[31m[31m            >[m[0m
[31m[31m              <HeartIcon[m[0m
[31m[31m                className={classNames([m[0m
[31m[31m                  "h-7 w-7",[m[0m
[31m[31m                  isFavorite[m[0m
[31m[31m                    ? "fill-red-400 stroke-red-400"[m[0m
[31m[31m                    : "fill-none stroke-gray-400"[m[0m
[31m[31m                )}[m[0m
[31m[31m              />[m[0m
[31m[31m            </Button>[m[0m
[31m[31m          </div>[m[0m
[31m[31m        </div>[m[0m
[31m[31m        <hr className="bg-gray-500" />[m[0m
[31m[31m        <ul className="space-y-6">[m[0m
[31m[31m          {reviews.reviews.map((review) => ([m[0m
[31m[31m            <li key={review.id} className="space-y-2">[m[0m
[31m[31m              <div className="flex items-center space-x-2 rounded-full">[m[0m
[31m[31m                <div className="relative h-12 w-12 overflow-hidden rounded-full">[m[0m
[31m[31m                  {review.user.imageUrl === undefined ||[m[0m
[31m[31m                  review.user.imageUrl === null ? ([m[0m
[31m[31m                    <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-slate-600">[m[0m
[31m[31m                      <UserIcon className="block h-6 w-6" aria-hidden />[m[0m
[31m[31m                    </div>[m[0m
[31m[31m                  ) : ([m[0m
[31m[31m                    <Image[m[0m
[31m[31m                      src={review.user.imageUrl}[m[0m
[31m[31m                      alt={review.user.name}[m[0m
[31m[31m                      fill[m[0m
[31m[31m                      className="relative"[m[0m
[31m[31m                      objectFit="cover"[m[0m
[31m[31m                    />[m[0m
[31m[31m                  )}[m[0m
[31m[31m                </div>[m[0m
[31m[31m                <p className="semi-bold">{review.user.name}</p>[m[0m
[31m[31m              </div>[m[0m
[31m[31m              <p>{review.text}</p>[m[0m
[31m[31m            </li>[m[0m
[31m[31m          ))}[m[0m
[31m[31m        </ul>[m[0m
[31m[31m      </div>[m[0m
[31m[31m    );[m[0m
[31m[31m  }, [restaurant, reviews, isFavorite, handleFavoriteClick]);[m[0m
[7m[31m [m
[31m[31m  return <Layout>{maybeRenderBody()}</Layout>;[m[0m
[31m[31m}[m[0m
[33m[0m[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[33mmodified: src/server/trpc/router/favoriteRestaurant.ts
[33m───────────────────────────────────────────────────────────────────────────────────────────────────────────────────[0m
[35m[35m@ src/server/trpc/router/favoriteRestaurant.ts:13 @[1m[1m[38;5;146m export const favoriteRestaurant = router({[0m
    });[m
  }),[m
  add: protectedProcedure[m
[31m[1;31m    .input(z.object({ [m[1;31;48;5;52mrestaurantI[m[1;31md: z.string() }))[m[0m
[31m[1;31m    .mutation([m[1;31;48;5;52masync [m[1;31m({ input, ctx }) => {[m[0m
[32m[1;32m    .input(z.object({ [m[1;32;48;5;22mi[m[1;32md: z.string() }))[m[0m
[32m[1;32m    .mutation([m[1;32;48;5;22m[m[1;32m({ input, ctx }) => {[m[0m
      return ctx.prisma.favoriteRestaurant.create({[m
        data: {[m
[31m[1;31m          [m[1;31;48;5;52m...input[m[1;31m,[m[0m
[32m[1;32m          [m[1;32;48;5;22mid: input.id[m[1;32m,[m[0m
          userId: ctx.session.user.id,[m
        },[m
      });[m
    }),[m
[32m[32m[m[32m  remove: protectedProcedure[m[0m
[32m[32m[m[32m    .input(z.object({ id: z.string() }))[m[0m
[32m[32m[m[32m    .mutation(({ input, ctx }) => {[m[0m
[32m[32m[m[32m      return ctx.prisma.favoriteRestaurant.delete({[m[0m
[32m[32m[m[32m        where: {[m[0m
[32m[32m[m[32m          id: input.id,[m[0m
[32m[32m[m[32m        },[m[0m
[32m[32m[m[32m      });[m[0m
[32m[32m[m[32m    }),[m[0m
  byId: protectedProcedure[m
    .input(z.object({ id: z.string() }))[m
[31m[1;31m    .query([m[1;31;48;5;52masync [m[1;31m({ input, ctx }) => {[m[0m
[32m[1;32m    .query([m[1;32;48;5;22m[m[1;32m({ input, ctx }) => {[m[0m
      return ctx.prisma.favoriteRestaurant.findUniqueOrThrow({[m
        where: {[m
          id: input.id,[m
