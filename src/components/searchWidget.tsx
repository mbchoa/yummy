import { useCallback, useEffect, useState } from "react";
import { trpc } from "../utils/trpc";

export const SearchWidget = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [location, setLocation] = useState("");
  const [currentFocus, setCurrentFocus] = useState<string | undefined>();

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
      location.length === 0 ||
      (currentFocus !== "search" && currentFocus !== "location")
    ) {
      return null;
    }

    return (
      <ul className="absolute top-full left-0 right-0 bg-white p-4 drop-shadow-xl">
        {data.businesses.map((business) => {
          return (
            <li key={business.id}>
              <p>{business.name}</p>
            </li>
          );
        })}
      </ul>
    );
  }, [data, searchTerm, location, currentFocus]);

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

  const handleFocusChange = useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setCurrentFocus(event.target.name);
    },
    []
  );

  const handleBlurChange = useCallback(() => {
    requestAnimationFrame(() => {
      if (
        document !== null &&
        !(document.activeElement instanceof HTMLInputElement)
      ) {
        setCurrentFocus(undefined);
      }
    });
  }, []);

  return (
    <div
      className="sticky p-4"
      onFocus={handleFocusChange}
      onBlur={handleBlurChange}
    >
      <input
        className="w-full rounded border px-3 py-2"
        value={searchTerm}
        onChange={handleSearchChange}
        name="search"
      />
      {(currentFocus === "search" || currentFocus === "location") && (
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
