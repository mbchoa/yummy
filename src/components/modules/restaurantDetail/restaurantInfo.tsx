import {
  ArrowTopRightOnSquareIcon,
  MapIcon,
  PhoneIcon,
} from "@heroicons/react/24/outline";
import { StarIcon } from "@heroicons/react/24/solid";
import uniqBy from "lodash-es/uniqBy";
import type { RouterOutputs } from "../../../utils/trpc";

type Restaurant = RouterOutputs["yelp"]["byId"];

// Yelp times are "HHMM" in the restaurant's local time, e.g. "1600"
const formatTime = (time: string) => {
  const hours = Number(time.slice(0, 2));
  const minutes = time.slice(2);
  const period = hours < 12 ? "AM" : "PM";
  return `${hours % 12 === 0 ? 12 : hours % 12}:${minutes} ${period}`;
};

// Yelp's is_open_now is computed when the details are fetched, and they're
// cached for days, so today's hours are shown instead
const getHoursToday = (restaurant: Restaurant) => {
  const regularHours =
    restaurant.hours?.find((hours) => hours.hoursType === "REGULAR") ??
    restaurant.hours?.[0];
  if (regularHours === undefined) {
    return null;
  }

  // Yelp numbers days from Monday (0); getDay() from Sunday (0)
  const today = (new Date().getDay() + 6) % 7;
  const openToday = regularHours.open.filter((open) => open.day === today);
  if (openToday.length === 0) {
    return "Closed today";
  }
  return `Open today ${openToday
    .map((open) => `${formatTime(open.start)} – ${formatTime(open.end)}`)
    .join(", ")}`;
};

interface IRestaurantInfoProps {
  restaurant: Restaurant;
}

export const RestaurantInfo = ({ restaurant }: IRestaurantInfoProps) => {
  // Yelp can repeat categories
  const categories = uniqBy(restaurant.categories, "alias").map(
    (category) => category.title,
  );
  const hoursToday = getHoursToday(restaurant);
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
    [restaurant.name, ...restaurant.location.displayAddress].join(", "),
  )}`;

  return (
    <div className="space-y-2">
      <p className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-gray-600">
        <span className="flex items-center gap-1">
          <StarIcon className="h-4 w-4 text-yellow-500" aria-hidden />
          {restaurant.rating}
          <span className="text-gray-400">
            ({restaurant.reviewCount.toLocaleString()} on Yelp)
          </span>
        </span>
        {restaurant.price && (
          <>
            <span aria-hidden>&middot;</span>
            <span>{restaurant.price}</span>
          </>
        )}
        {categories.length > 0 && (
          <>
            <span aria-hidden>&middot;</span>
            <span>{categories.join(", ")}</span>
          </>
        )}
      </p>
      <address className="not-italic text-gray-700">
        {restaurant.location.displayAddress.join(", ")}
      </address>
      {hoursToday !== null && (
        <p className="text-sm text-gray-600">{hoursToday}</p>
      )}
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm">
        {restaurant.phone && (
          <a
            href={`tel:${restaurant.phone}`}
            className="flex items-center gap-1 text-indigo-600 hover:underline"
          >
            <PhoneIcon className="h-4 w-4" aria-hidden />
            {restaurant.displayPhone || restaurant.phone}
          </a>
        )}
        <a
          href={directionsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-600 hover:underline"
        >
          <MapIcon className="h-4 w-4" aria-hidden />
          Directions
        </a>
        <a
          href={restaurant.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1 text-indigo-600 hover:underline"
        >
          <ArrowTopRightOnSquareIcon className="h-4 w-4" aria-hidden />
          View on Yelp
        </a>
      </div>
    </div>
  );
};

export const RestaurantInfoSkeleton = () => (
  <div className="space-y-2">
    <div className="h-5 w-56 animate-pulse rounded bg-gray-300" />
    <div className="h-5 w-72 animate-pulse rounded bg-gray-300" />
    <div className="h-5 w-40 animate-pulse rounded bg-gray-300" />
  </div>
);
