import { latLngBounds } from "leaflet";
import "leaflet/dist/leaflet.css";
import Link from "next/link";
import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { IYelpBusinessSchema } from "../../../models/YelpSchemas";

type Restaurant = SnakeToCamelCaseNested<IYelpBusinessSchema>;

interface IRestaurantsMapProps {
  restaurants: Restaurant[];
}

// leaflet needs the browser, so this is loaded with next/dynamic and ssr off
export default function RestaurantsMap({ restaurants }: IRestaurantsMapProps) {
  return (
    // own stacking context, so leaflet's panes stay under the header and the
    // search results
    <div className="relative z-0 h-[60vh] min-h-[320px] overflow-hidden rounded-lg">
      <MapContainer
        className="h-full w-full"
        center={[0, 0]}
        zoom={2}
        scrollWheelZoom={false}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {restaurants.map((restaurant) => (
          <CircleMarker
            key={restaurant.id}
            center={[
              restaurant.coordinates.latitude,
              restaurant.coordinates.longitude,
            ]}
            radius={9}
            pathOptions={{
              color: "#4338ca",
              fillColor: "#6366f1",
              fillOpacity: 0.9,
              weight: 2,
            }}
          >
            <Popup>
              <Link
                href={{
                  pathname: "/dashboard/restaurant/[restaurantId]",
                  query: { restaurantId: restaurant.id },
                }}
                className="font-medium"
              >
                {restaurant.name}
              </Link>
              <br />
              <span className="text-gray-600">
                {restaurant.location.displayAddress.join(", ")}
              </span>
            </Popup>
          </CircleMarker>
        ))}
        <FitToRestaurants restaurants={restaurants} />
      </MapContainer>
    </div>
  );
}

// zooms to show every pin, again whenever the tab or filter changes them
const FitToRestaurants = ({ restaurants }: IRestaurantsMapProps) => {
  const map = useMap();
  useEffect(() => {
    if (restaurants.length === 0) {
      return;
    }
    map.fitBounds(
      latLngBounds(
        restaurants.map((restaurant) => [
          restaurant.coordinates.latitude,
          restaurant.coordinates.longitude,
        ]),
      ),
      { padding: [32, 32], maxZoom: 15 },
    );
  }, [map, restaurants]);
  return null;
};
