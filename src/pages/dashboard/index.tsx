import { Tab } from "@headlessui/react";
import { Like } from "@prisma/client";
import classNames from "classnames";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { useCallback, useMemo, useState } from "react";
import { Layout } from "../../components/layout";
import { ListDropDown } from "../../components/modules/dashboard/listDropdown";
import { RestaurantsList } from "../../components/modules/dashboard/restaurantsList";
import type { IYelpBusinessSchema } from "../../models/YelpSchemas";
import { requireAuth } from "../../server/common/require-auth";
import { trpc } from "../../utils/trpc";

// the tab's slug is kept in the URL (?tab=), so refresh and back keep it
const TABS = [
  { like: Like.LIKE, label: "Liked", slug: undefined },
  { like: Like.DISLIKE, label: "Disliked", slug: "dislikes" },
  { like: Like.WANT_TO_TRY, label: "Want to try", slug: "want-to-try" },
] as const;

type Restaurant = SnakeToCamelCaseNested<IYelpBusinessSchema>;

// a tab's saved restaurants, and their details from Yelp
const useTabRestaurants = (
  like: (typeof TABS)[number]["like"],
  enabled: boolean,
) => {
  const saved = trpc.favoriteRestaurant.all.useQuery(
    { like },
    { enabled, keepPreviousData: true },
  );
  const yelp = trpc.yelp.byIds.useQuery(
    (saved.data ?? []).map((restaurant) => restaurant.restaurantId),
    {
      enabled: saved.data !== undefined,
      keepPreviousData: true,
      trpc: {
        context: {
          skipBatch: true,
        },
      },
    },
  );
  return { saved, yelp };
};

export default function Dashboard() {
  const { data: session } = useSession();
  const router = useRouter<"/dashboard">();
  const selectedTabIndex = Math.max(
    0,
    TABS.findIndex((tab) => tab.slug === router.query.tab),
  );
  const handleTabChange = useCallback(
    (index: number) => {
      const slug = TABS[index]?.slug;
      router.replace(
        {
          pathname: "/dashboard",
          query: slug !== undefined ? { tab: slug } : {},
        },
        undefined,
        { shallow: true },
      );
    },
    [router],
  );
  const [filter, setFilter] = useState("");
  const normalizedFilter = filter.trim().toLowerCase();
  const liked = useTabRestaurants(Like.LIKE, session !== undefined);
  const disliked = useTabRestaurants(Like.DISLIKE, session !== undefined);
  const wantToTry = useTabRestaurants(Like.WANT_TO_TRY, session !== undefined);

  const refetch = useCallback(async () => {
    for (const { saved, yelp } of [liked, disliked, wantToTry]) {
      await saved.refetch();
      await yelp.refetch();
    }
  }, [liked, disliked, wantToTry]);

  // what's saved about each restaurant, across all tabs
  const savedRestaurants = useMemo(
    () => [
      ...(liked.saved.data ?? []),
      ...(disliked.saved.data ?? []),
      ...(wantToTry.saved.data ?? []),
    ],
    [liked.saved.data, disliked.saved.data, wantToTry.saved.data],
  );
  const likedDishNamesByRestaurantId = useMemo(
    () =>
      Object.fromEntries(
        savedRestaurants.map((restaurant) => [
          restaurant.restaurantId,
          restaurant.restaurantItems.map(
            (restaurantItem) => restaurantItem.name,
          ),
        ]),
      ),
    [savedRestaurants],
  );
  const dishCountByRestaurantId = useMemo(
    () =>
      Object.fromEntries(
        savedRestaurants.map((restaurant) => [
          restaurant.restaurantId,
          restaurant._count.restaurantItems,
        ]),
      ),
    [savedRestaurants],
  );
  const noteByRestaurantId = useMemo(
    () =>
      Object.fromEntries(
        savedRestaurants.map((restaurant) => [
          restaurant.restaurantId,
          restaurant.note,
        ]),
      ),
    [savedRestaurants],
  );

  const data = useMemo(() => {
    // matches the restaurant's liked dishes or its note
    const matchesSaved = (restaurantId: string) =>
      [
        ...(likedDishNamesByRestaurantId[restaurantId] ?? []),
        noteByRestaurantId[restaurantId] ?? "",
      ].some((text) => text.toLowerCase().includes(normalizedFilter));
    // matches the restaurant's name, city, categories, liked dishes or note
    const filterRestaurants = (restaurants: Restaurant[]) =>
      normalizedFilter.length === 0
        ? restaurants
        : restaurants.filter(
            (restaurant) =>
              [
                restaurant.name,
                restaurant.location.city,
                ...restaurant.categories.map((category) => category.title),
              ].some((text) => text.toLowerCase().includes(normalizedFilter)) ||
              matchesSaved(restaurant.id),
          );
    // missing restaurants have no Yelp details, so only what's saved can match
    const filterMissing = (restaurantIds: string[]) =>
      normalizedFilter.length === 0
        ? restaurantIds
        : restaurantIds.filter(matchesSaved);

    return [liked, disliked, wantToTry].map(({ saved, yelp }) => ({
      restaurantsGroupedByCity:
        yelp.data !== undefined
          ? groupRestaurantsByCity(filterRestaurants(yelp.data))
          : undefined,
      missingRestaurantIds: filterMissing(
        findMissingRestaurantIds(saved.data, yelp.data, yelp.isPreviousData),
      ),
      isLoading: saved.isLoading || yelp.isLoading,
    }));
  }, [
    liked,
    disliked,
    wantToTry,
    likedDishNamesByRestaurantId,
    noteByRestaurantId,
    normalizedFilter,
  ]);

  const maybeRenderPanels = useCallback(() => {
    return data.map(
      ({ isLoading, restaurantsGroupedByCity, missingRestaurantIds }, idx) => (
        <Tab.Panel
          key={idx}
          className={classNames(
            "rounded-xl bg-white p-4",
            "ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
            "drop-shadow-md",
          )}
        >
          <RestaurantsList
            isLoading={isLoading}
            restaurants={restaurantsGroupedByCity}
            missingRestaurantIds={missingRestaurantIds}
            dishCountByRestaurantId={dishCountByRestaurantId}
            likedDishNamesByRestaurantId={likedDishNamesByRestaurantId}
            noteByRestaurantId={noteByRestaurantId}
            isFiltered={normalizedFilter.length > 0}
            isWantToTry={TABS[idx]?.like === Like.WANT_TO_TRY}
          />
        </Tab.Panel>
      ),
    );
  }, [
    data,
    dishCountByRestaurantId,
    likedDishNamesByRestaurantId,
    noteByRestaurantId,
    normalizedFilter,
  ]);

  return (
    <Layout>
      <div className="px-4">
        <Tab.Group selectedIndex={selectedTabIndex} onChange={handleTabChange}>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-200 p-1">
              {TABS.map((tab) => (
                <Tab
                  key={tab.label}
                  className={({ selected }) =>
                    classNames(
                      "whitespace-nowrap rounded-lg px-3 py-2 text-sm font-medium leading-5 transition-all sm:px-6",
                      "ring-white ring-opacity-60 ring-offset-2 ring-offset-indigo-400 focus:outline-none focus:ring-2",
                      selected
                        ? "bg-white text-indigo-600 shadow"
                        : "text-gray-600 hover:bg-white/60 hover:text-gray-900",
                    )
                  }
                >
                  {tab.label}
                </Tab>
              ))}
            </Tab.List>
            <ListDropDown onSwitchUser={refetch} />
          </div>
          <label className="mt-4 block">
            <span className="sr-only">Filter your list</span>
            <input
              type="search"
              className="w-full rounded border px-3 py-2 text-sm outline-indigo-500"
              placeholder="Filter by name, city, cuisine, dish or note"
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
            />
          </label>
          <Tab.Panels className="mt-4">{maybeRenderPanels()}</Tab.Panels>
        </Tab.Group>
      </div>
    </Layout>
  );
}

// saved restaurants that Yelp no longer has; yelp.byIds skips them, so they
// would otherwise vanish from the dashboard
const findMissingRestaurantIds = (
  savedRestaurants: { restaurantId: string }[] | undefined,
  yelpRestaurants: { id: string }[] | undefined,
  isPreviousData: boolean,
) => {
  // while Yelp data from the previous list is still shown, the two lists don't
  // correspond
  if (
    savedRestaurants === undefined ||
    yelpRestaurants === undefined ||
    isPreviousData
  ) {
    return [];
  }
  const yelpIds = new Set(yelpRestaurants.map((restaurant) => restaurant.id));
  return savedRestaurants
    .map((restaurant) => restaurant.restaurantId)
    .filter((restaurantId) => !yelpIds.has(restaurantId));
};

const groupRestaurantsByCity = (
  restaurants: SnakeToCamelCaseNested<IYelpBusinessSchema>[],
) => {
  const restaurantsGroupedByCity: Record<string, typeof restaurants> = {};
  restaurants.forEach((restaurant) => {
    const city = restaurant.location.city;
    const restaurantsInCity = restaurantsGroupedByCity[city];
    if (restaurantsInCity === undefined) {
      restaurantsGroupedByCity[city] = [restaurant];
    } else {
      restaurantsGroupedByCity[city] = [...restaurantsInCity, restaurant];
    }
  });

  // sort restaurants within each city
  Object.keys(restaurantsGroupedByCity).forEach((city) => {
    if (restaurantsGroupedByCity[city] !== undefined) {
      restaurantsGroupedByCity[city]?.sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    }
  });

  return restaurantsGroupedByCity;
};

export const getServerSideProps = requireAuth;
