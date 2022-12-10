import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useClickAway } from "react-use";
import { trpc } from "../utils/trpc";

export const SearchWidget = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("Los Angeles, CA");
  const [isLocationInputEnabled, setIsLocationInputEnabled] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const { data, refetch } = trpc.yelp.search.useQuery(
    {
      location,
      term: searchTerm,
    },
    { enabled: false }
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length > 0 && location.length > 0) {
        refetch();
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, location, refetch]);

  const maybeRenderSearchResults = useCallback(() => {
    if (
      data === undefined ||
      data.businesses.length === 0 ||
      searchTerm.length === 0 ||
      location.length === 0
    ) {
      return null;
    }

    return (
      <ul className="absolute top-full left-0 right-0 space-y-4 bg-white p-4 drop-shadow-xl">
        {data.businesses.map((business) => {
          return (
            <li key={business.id}>
              <Link
                href={{
                  pathname: "/restaurant/[restaurantId]",
                  query: { restaurantId: business.id },
                }}
              >
                {business.name}
              </Link>
            </li>
          );
        })}
      </ul>
    );
  }, [data, searchTerm, location]);

  const handleSearchChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  const handleLocationChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocation(event.target.value);
    },
    []
  );

  const handleFocusChange = useCallback(() => {
    setIsLocationInputEnabled(true);
  }, []);

  useClickAway(ref, () => {
    setIsLocationInputEnabled(false);
  });

  return (
    <div className="sticky p-4" onFocus={handleFocusChange} ref={ref}>
      <input
        className="w-full rounded border px-3 py-2"
        value={searchTerm}
        onChange={handleSearchChange}
        placeholder="In 'N Out"
        name="search"
      />
      {isLocationInputEnabled && (
        <input
          className="mt-4 w-full rounded border px-3 py-2"
          value={location}
          onChange={handleLocationChange}
          name="location"
        />
      )}
      {maybeRenderSearchResults()}
    </div>
  );
};
