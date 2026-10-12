import { Menu, Transition } from "@headlessui/react";
import { UserIcon } from "@heroicons/react/24/outline";
import { signOut } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import React, { Fragment } from "react";
import { useRequireAuth } from "../hooks/useRequireAuth";
import { SearchWidget } from "./searchWidget";

interface IDashboardLayoutProps {
  children: React.ReactNode;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Layout: React.FC<IDashboardLayoutProps> = ({ children }) => {
  const { session } = useRequireAuth();
  return (
    <>
      <nav className="bg-gray-800">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4">
          <Link
            href="/dashboard"
            className="rounded-md font-semibold tracking-wide text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <span>yum</span>
            <span className="text-indigo-400">shin</span>
          </Link>
          {/* Profile dropdown */}
          <Menu as="div" className="relative ml-3">
            <div>
              <Menu.Button className="flex rounded-full bg-gray-800 text-sm focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-gray-800">
                <span className="sr-only">Open user menu</span>
                {session?.user?.image ? (
                  <Image
                    className="h-8 w-8 rounded-full"
                    src={session.user.image}
                    alt="Profile picture"
                    width={96}
                    height={96}
                  />
                ) : (
                  <UserIcon
                    className="h-8 w-8 rounded-full stroke-gray-300"
                    aria-hidden
                  />
                )}
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
              <Menu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <Menu.Item>
                  {({ active }) => (
                    <button
                      className={classNames(
                        active ? "bg-gray-100" : "",
                        "block w-full px-4 py-2 text-left text-sm text-gray-700",
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
      </nav>
      <main className="mx-auto h-full max-w-5xl">
        <SearchWidget />
        {children}
      </main>
    </>
  );
};
