import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  UserIcon,
  UserPlusIcon,
} from "@heroicons/react/24/outline";
import { partial } from "lodash-es";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Fragment, useCallback, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { AddCollaboratorModal } from "../../addCollaboratorModal";

interface IListDropDownProps {
  onSwitchUser: () => Promise<void>;
}

export const ListDropDown = ({ onSwitchUser }: IListDropDownProps) => {
  const [isAddCollaboratorModalOpen, setIsAddCollaboratorModalOpen] =
    useState(false);
  const closeModal = useCallback(() => {
    setIsAddCollaboratorModalOpen(false);
  }, []);
  const openModal = useCallback(() => {
    setIsAddCollaboratorModalOpen(true);
  }, []);
  const { data: session } = useSession();
  const { data: userSetting, refetch: refetchUserSetting } =
    trpc.userSetting.get.useQuery();
  const { data: otherUsers } = trpc.collaborator.allOwner.useQuery();
  const { data: currentListCollaborators } = trpc.collaborator.all.useQuery();
  const { mutateAsync: switchUser } = trpc.userSetting.switchUser.useMutation();

  const handleSelectUser = useCallback(
    async (userId: string | undefined) => {
      if (userId === undefined) {
        return;
      }

      await switchUser({ userId });
      onSwitchUser();
      refetchUserSetting();
    },
    [switchUser, onSwitchUser, refetchUserSetting]
  );

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-[10px] text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
            {userSetting?.selectedUserId === session?.user?.id
              ? "Personal"
              : otherUsers?.find(
                  (user) => user.ownerId === userSetting?.selectedUserId
                )?.owner.name}
            <ChevronDownIcon
              className="-mr-1 ml-2 h-5 w-5"
              aria-hidden="true"
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            <div className="py-1">
              <Menu.Item>
                <button
                  className="flex w-full px-4 py-2 text-sm text-gray-700"
                  onClick={partial(handleSelectUser, session?.user?.id)}
                >
                  {userSetting?.selectedUserId === session?.user?.id ? (
                    <CheckIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  ) : (
                    <div className="mr-2 h-5 w-5" aria-hidden="true"></div>
                  )}
                  Personal
                </button>
              </Menu.Item>
              {(otherUsers ?? []).map((user) => (
                <Menu.Item key={user.ownerId}>
                  <button
                    className="flex w-full px-4 py-2 text-sm text-gray-700"
                    onClick={partial(handleSelectUser, user.ownerId)}
                  >
                    {userSetting?.selectedUserId === user.ownerId ? (
                      <CheckIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    ) : (
                      <div className="mr-2 h-5 w-5" aria-hidden="true"></div>
                    )}
                    {user.owner.name}
                  </button>
                </Menu.Item>
              ))}
            </div>
            <div className="space-y-3 py-2">
              <div className="px-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Collaborators
                </p>
              </div>
              {(currentListCollaborators ?? []).map((user) => (
                <Menu.Item key={user.collaboratorId}>
                  <div className="flex w-full items-center gap-2 px-4 text-sm text-gray-700">
                    {user.collaborator.image === null ? (
                      <UserIcon
                        className="inline-block h-6 w-6 rounded-full stroke-gray-300"
                        aria-hidden
                      />
                    ) : (
                      <Image
                        className="inline-block h-6 w-6 rounded-full"
                        src={user.collaborator.image}
                        alt="Profile image"
                        width={20}
                        height={20}
                      />
                    )}
                    {user.collaborator.name}
                  </div>
                </Menu.Item>
              ))}
            </div>
            <div className="py-1">
              <Menu.Item>
                <button
                  className="flex px-4 py-2 text-sm text-gray-700"
                  onClick={openModal}
                >
                  <UserPlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                  Add collaborator
                </button>
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <AddCollaboratorModal
        isOpen={isAddCollaboratorModalOpen}
        closeModal={closeModal}
      />
    </>
  );
};
