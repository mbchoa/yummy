import {
  CalendarIcon,
  ChartBarIcon,
  FolderIcon,
  HomeIcon,
  InboxIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import React from "react";

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

export const DashboardLayout: React.FC<IDashboardLayoutProps> = ({
  children,
}) => {
  return (
    <>
      <main className="flex h-screen bg-gray-100">
        <div className="flex w-64 flex-col">
          <div className="flex flex-grow flex-col overflow-y-auto border-r border-gray-200 bg-white pt-5 pb-4">
            <div className="flex flex-shrink-0 items-center space-y-5 px-4">
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                <span className="text-[hsl(260,100%,70%)]">yum</span>
                <span className="text-[hsl(280,100%,70%)]">me</span>
              </h1>
            </div>
            <div className="mt-5 flex flex-grow flex-col">
              <nav className="flex-1 space-y-1 bg-white" aria-label="Sidebar">
                {navigation.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className={classNames(
                      item.current
                        ? "border-indigo-600 bg-indigo-50 text-indigo-600"
                        : "border-transparent text-gray-600 hover:bg-gray-50 hover:text-gray-900",
                      "group flex items-center border-l-4 px-3 py-2 text-sm font-medium"
                    )}
                  >
                    <item.icon
                      className={classNames(
                        item.current
                          ? "text-indigo-500"
                          : "text-gray-400 group-hover:text-gray-500",
                        "mr-3 h-6 w-6 flex-shrink-0"
                      )}
                      aria-hidden="true"
                    />
                    {item.name}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        </div>
        <div className="w-full p-4">{children}</div>
      </main>
    </>
  );
};
