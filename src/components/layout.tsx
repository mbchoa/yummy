import { Disclosure, Menu, Transition } from "@headlessui/react";
import {
  Bars3Icon,
  BellIcon,
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import Image from "next/image";
import React, { Fragment, useEffect } from "react";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { trpc } from "../utils/trpc";

interface IDashboardLayoutProps {
  children: React.ReactNode;
}

const navigation = [
  { name: "Dashboard", icon: HomeIcon, href: "#", current: true },
  { name: "Team", icon: UsersIcon, href: "#", current: false },
  { name: "Projects", icon: FolderIcon, href: "#", current: false },
  { name: "Calendar", icon: CalendarIcon, href: "#", current: false },
  { name: "Documents", icon: InboxIcon, href: "#", current: false },
  { name: "Reports", icon: ChartBarIcon, href: "#", current: false },
];

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Layout: React.FC<IDashboardLayoutProps> = ({ children }) => {
  const { session } = useRequireAuth();
  const [searchTerm, setSearchTerm] = React.useState("");
  const [location, setLocation] = React.useState("");
  const [currentFocus, setCurrentFocus] = React.useState<string | undefined>();

  const { data, refetch } = trpc.yelp.search.useQuery(
    {
      location,
      term: searchTerm,
    },
    { enabled: false }
  );

  const maybeRenderSearchResults = React.useCallback(() => {
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
      <ul className="absolute top-full left-0 right-0 bg-white p-4">
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

  const handleSearchChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(event.target.value);
    },
    []
  );

  const handleLocationChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setLocation(event.target.value);
    },
    []
  );

  const handleFocusChange = React.useCallback(
    (event: React.FocusEvent<HTMLInputElement>) => {
      setCurrentFocus(event.target.name);
    },
    []
  );

  const handleBlurChange = React.useCallback(() => {
    requestAnimationFrame(() => {
      if (
        document !== null &&
        !(document.activeElement instanceof HTMLInputElement)
      ) {
        setCurrentFocus(undefined);
      }
    });
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchTerm.length > 0 && location.length > 0) {
        refetch();
      }
    }, 250);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, location, refetch]);

  return (
    <>
      <Disclosure as="nav" className="bg-gray-800">
        {({ open }) => (
          <>
            <div className="mx-auto max-w-7xl px-2 sm:px-6 lg:px-8">
              <div className="relative flex h-16 items-center justify-between">
                <div className="absolute inset-y-0 left-0 flex items-center sm:hidden">
                  {/* Mobile menu button*/}
                  <Disclosure.Button className="inline-flex items-center justify-center rounded-md p-2 text-gray-400 hover:bg-gray-700 hover:text-white focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white">
                    <span className="sr-only">Open main menu</span>
                    {open ? (
                      <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
                    ) : (
                      <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
                    )}
                  </Disclosure.Button>
                </div>
                <div className="flex flex-1 items-center justify-center sm:items-stretch sm:justify-start">
                  <div className="hidden sm:block">
                    <div className="flex space-x-4">
                      {navigation.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className={classNames(
                            item.current
                              ? "bg-gray-900 text-white"
                              : "text-gray-300 hover:bg-gray-700 hover:text-white",
                            "rounded-md px-3 py-2 text-sm font-medium"
                          )}
                          aria-current={item.current ? "page" : undefined}
                        >
                          {item.name}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-y-0 right-0 flex items-center pr-2 sm:static sm:inset-auto sm:ml-6 sm:pr-0">
                  <button
                    type="button"
                    className="rounded-full bg-gray-800 p-1 text-gray-400 hover:text-white focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800"
                  >
                    <span className="sr-only">View notifications</span>
                    <BellIcon className="h-6 w-6" aria-hidden="true" />
                  </button>

                  {/* Profile dropdown */}
                  <Menu as="div" className="relative ml-3">
                    <div>
                      <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                        <span className="sr-only">Open user menu</span>
                        <Image
                          className="h-8 w-8 rounded-full"
                          src={session?.user?.image ?? ""}
                          alt="Profile picture"
                          width={96}
                          height={96}
                        />
                      </Menu.Button>
                    </div>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Your Profile
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <a
                              href="#"
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block px-4 py-2 text-sm text-gray-700"
                              )}
                            >
                              Settings
                            </a>
                          )}
                        </Menu.Item>
                        <Menu.Item>
                          {({ active }) => (
                            <button
                              className={classNames(
                                active ? "bg-gray-100" : "",
                                "block w-full px-4 py-2 text-left text-sm text-gray-700"
                              )}
                              onClick={() => signOut()}
                            >
                              Sign out
                            </button>
                          )}
                        </Menu.Item>
                      </Menu.Items>
                    </Transition>
                  </Menu>
                </div>
              </div>
            </div>

            <Disclosure.Panel className="sm:hidden">
              <div className="space-y-1 px-2 pt-2 pb-3">
                {navigation.map((item) => (
                  <Disclosure.Button
                    key={item.name}
                    as="a"
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "bg-gray-900 text-white"
                        : "text-gray-300 hover:bg-gray-700 hover:text-white",
                      "block rounded-md px-3 py-2 text-base font-medium"
                    )}
                    aria-current={item.current ? "page" : undefined}
                  >
                    {item.name}
                  </Disclosure.Button>
                ))}
              </div>
            </Disclosure.Panel>
          </>
        )}
      </Disclosure>
      <main className="h-full">
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
        <div className="flex">{children}</div>
      </main>
    </>
  );
};
