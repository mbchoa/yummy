import { Menu, Transition } from "@headlessui/react";
import {
  CheckIcon,
  ChevronDownIcon,
  UserIcon,
  UserPlusIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";
import { CollaboratorRole, CollaboratorStatus } from "@prisma/client";
import classNames from "classnames";
import { partial } from "lodash-es";
import { useSession } from "next-auth/react";
import Image from "next/image";
import { Fragment, useCallback, useState } from "react";
import { trpc } from "../../../utils/trpc";
import { AddCollaboratorModal } from "../../addCollaboratorModal";
import { Button } from "../../button";
import { ManageSharingModal } from "../../manageSharingModal";

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
  const [isManageSharingModalOpen, setIsManageSharingModalOpen] =
    useState(false);
  const { data: session } = useSession();
  const { data: userSetting, refetch: refetchUserSetting } =
    trpc.userSetting.get.useQuery();
  const { data: otherUsers, refetch: refetchOtherUsers } =
    trpc.collaborator.allOwner.useQuery();
  const { data: currentListCollaborators } = trpc.collaborator.all.useQuery();
  const { data: invites, refetch: refetchInvites } =
    trpc.collaborator.invites.useQuery();
  const { mutateAsync: switchUser } = trpc.userSetting.switchUser.useMutation();
  const { mutateAsync: acceptInvite, isLoading: isAccepting } =
    trpc.collaborator.accept.useMutation();
  const { mutateAsync: declineInvite, isLoading: isDeclining } =
    trpc.collaborator.decline.useMutation();
  const inviteCount = invites?.length ?? 0;
  const utils = trpc.useContext();

  // an accepted list shows up with your other lists, ready to switch to
  const handleAcceptInvite = useCallback(
    async (ownerId: string) => {
      await acceptInvite({ ownerId });
      await Promise.all([refetchInvites(), refetchOtherUsers()]);
    },
    [acceptInvite, refetchInvites, refetchOtherUsers],
  );

  const handleDeclineInvite = useCallback(
    async (ownerId: string) => {
      await declineInvite({ ownerId });
      await refetchInvites();
    },
    [declineInvite, refetchInvites],
  );

  const handleSelectUser = useCallback(
    async (userId: string | undefined) => {
      if (userId === undefined) {
        return;
      }

      await switchUser({ userId });
      // what you can do depends on the list
      utils.userSetting.access.invalidate();
      onSwitchUser();
      refetchUserSetting();
    },
    [switchUser, utils, onSwitchUser, refetchUserSetting],
  );

  // leaving the list you're viewing switches you back to your own
  const handleLeaveList = useCallback(async () => {
    utils.userSetting.access.invalidate();
    await refetchUserSetting();
    await onSwitchUser();
  }, [utils, onSwitchUser, refetchUserSetting]);

  return (
    <>
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="inline-flex w-full justify-center rounded-md border border-gray-300 bg-white px-4 py-[10px] text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-100">
            {userSetting?.selectedUserId === session?.user?.id
              ? "Personal"
              : otherUsers?.find(
                  (user) => user.ownerId === userSetting?.selectedUserId,
                )?.owner.name}
            {inviteCount > 0 && (
              <span className="ml-2 rounded-full bg-indigo-600 px-1.5 text-xs font-semibold leading-5 text-white">
                {inviteCount}
                <span className="sr-only">
                  {inviteCount === 1 ? " invite" : " invites"}
                </span>
              </span>
            )}
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
          <Menu.Items className="absolute right-0 z-10 mt-2 w-64 origin-top-right divide-y divide-gray-100 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
            {inviteCount > 0 && (
              <div className="space-y-3 py-3">
                <p className="px-4 text-xs font-semibold uppercase text-gray-500">
                  Invites
                </p>
                {(invites ?? []).map((invite) => (
                  <div key={invite.id} className="space-y-2 px-4">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">
                        {invite.owner.name ?? invite.owner.email ?? "Someone"}
                      </span>{" "}
                      invited you to{" "}
                      {invite.role === CollaboratorRole.EDITOR
                        ? "edit"
                        : "view"}{" "}
                      their list
                    </p>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        isLoading={isAccepting}
                        disabled={isDeclining}
                        onClick={() => handleAcceptInvite(invite.ownerId)}
                      >
                        Accept
                      </Button>
                      <Button
                        size="sm"
                        variant="outlined"
                        isLoading={isDeclining}
                        disabled={isAccepting}
                        onClick={() => handleDeclineInvite(invite.ownerId)}
                      >
                        Decline
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      "flex w-full px-4 py-2 text-sm text-gray-700",
                      active && "bg-gray-100",
                    )}
                    onClick={partial(handleSelectUser, session?.user?.id)}
                  >
                    {userSetting?.selectedUserId === session?.user?.id ? (
                      <CheckIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    ) : (
                      <div className="mr-2 h-5 w-5" aria-hidden="true"></div>
                    )}
                    Personal
                  </button>
                )}
              </Menu.Item>
              {(otherUsers ?? []).map((user) => (
                <Menu.Item key={user.ownerId}>
                  {({ active }) => (
                    <button
                      className={classNames(
                        "flex w-full px-4 py-2 text-sm text-gray-700",
                        active && "bg-gray-100",
                      )}
                      onClick={partial(handleSelectUser, user.ownerId)}
                    >
                      {userSetting?.selectedUserId === user.ownerId ? (
                        <CheckIcon
                          className="mr-2 h-5 w-5"
                          aria-hidden="true"
                        />
                      ) : (
                        <div className="mr-2 h-5 w-5" aria-hidden="true"></div>
                      )}
                      {user.owner.name}
                    </button>
                  )}
                </Menu.Item>
              ))}
            </div>
            {/* not menu items: nothing to do with them, so keyboard focus skips
                them */}
            <div className="space-y-3 py-2">
              <div className="px-4">
                <p className="text-xs font-semibold uppercase text-gray-500">
                  Collaborators
                </p>
              </div>
              {(currentListCollaborators ?? []).map((user) => (
                <div
                  key={user.collaboratorId}
                  className="flex w-full items-center gap-2 px-4 text-sm text-gray-700"
                >
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
                  <span className="min-w-0 flex-1 truncate">
                    {user.collaborator.name}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {user.status === CollaboratorStatus.PENDING
                      ? "Invited"
                      : user.role === CollaboratorRole.VIEWER
                        ? "Viewer"
                        : "Editor"}
                  </span>
                </div>
              ))}
            </div>
            <div className="py-1">
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      "flex w-full px-4 py-2 text-sm text-gray-700",
                      active && "bg-gray-100",
                    )}
                    onClick={openModal}
                  >
                    <UserPlusIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    Invite someone
                  </button>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button
                    className={classNames(
                      "flex w-full px-4 py-2 text-sm text-gray-700",
                      active && "bg-gray-100",
                    )}
                    onClick={() => setIsManageSharingModalOpen(true)}
                  >
                    <UsersIcon className="mr-2 h-5 w-5" aria-hidden="true" />
                    Manage sharing
                  </button>
                )}
              </Menu.Item>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
      <AddCollaboratorModal
        isOpen={isAddCollaboratorModalOpen}
        closeModal={closeModal}
      />
      <ManageSharingModal
        isOpen={isManageSharingModalOpen}
        closeModal={() => setIsManageSharingModalOpen(false)}
        onLeaveList={handleLeaveList}
      />
    </>
  );
};
