import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import React, { Fragment, useState } from "react";
import { trpc } from "../utils/trpc";
import { Button } from "./button";

interface IManageSharingModalProps {
  isOpen: boolean;
  closeModal: () => void;
  // called after leaving a list, since you may have been viewing it
  onLeaveList: () => Promise<void>;
}

interface ISharingRowProps {
  name: string | null;
  email: string | null;
  actionLabel: string;
  confirmText: string;
  isWorking: boolean;
  onConfirm: () => Promise<void>;
}

const SharingRow = ({
  name,
  email,
  actionLabel,
  confirmText,
  isWorking,
  onConfirm,
}: ISharingRowProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  return (
    <li className="space-y-2 py-2">
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-gray-900">
            {name ?? email ?? "Unknown"}
          </p>
          {name !== null && email !== null && (
            <p className="truncate text-xs text-gray-500">{email}</p>
          )}
        </div>
        {!isConfirming && (
          <Button
            size="sm"
            variant="outlined"
            onClick={() => setIsConfirming(true)}
          >
            {actionLabel}
          </Button>
        )}
      </div>
      {isConfirming && (
        <div className="space-y-2 rounded border border-gray-200 p-3">
          <p className="text-sm text-gray-700">{confirmText}</p>
          <div className="flex gap-2">
            <Button size="sm" isLoading={isWorking} onClick={onConfirm}>
              {actionLabel}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={() => setIsConfirming(false)}
            >
              Cancel
            </Button>
          </div>
        </div>
      )}
    </li>
  );
};

export const ManageSharingModal = ({
  isOpen,
  closeModal,
  onLeaveList,
}: IManageSharingModalProps) => {
  const { data: collaborators, refetch: refetchCollaborators } =
    trpc.collaborator.all.useQuery();
  const { data: sharedLists, refetch: refetchSharedLists } =
    trpc.collaborator.allOwner.useQuery();
  const { mutateAsync: removeCollaborator, isLoading: isRemoving } =
    trpc.collaborator.remove.useMutation();
  const { mutateAsync: leaveList, isLoading: isLeaving } =
    trpc.collaborator.leave.useMutation();

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black bg-opacity-25" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                <div className="flex items-center justify-between">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    Manage sharing
                  </Dialog.Title>
                  <button
                    type="button"
                    className="rounded-md p-1 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    onClick={closeModal}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-5 w-5" aria-hidden />
                  </button>
                </div>

                <section className="mt-4">
                  <h4 className="text-xs font-semibold uppercase text-gray-500">
                    People who can edit your list
                  </h4>
                  {collaborators !== undefined && collaborators.length === 0 ? (
                    <p className="py-2 text-sm text-gray-500">
                      Nobody yet. Use &ldquo;Add collaborator&rdquo; to share
                      your list.
                    </p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {(collaborators ?? []).map((collaborator) => (
                        <SharingRow
                          key={collaborator.id}
                          name={collaborator.collaborator.name}
                          email={collaborator.collaborator.email}
                          actionLabel="Remove"
                          confirmText="They'll no longer be able to see or edit your list."
                          isWorking={isRemoving}
                          onConfirm={async () => {
                            await removeCollaborator({ id: collaborator.id });
                            await refetchCollaborators();
                          }}
                        />
                      ))}
                    </ul>
                  )}
                </section>

                <section className="mt-6">
                  <h4 className="text-xs font-semibold uppercase text-gray-500">
                    Lists shared with you
                  </h4>
                  {sharedLists !== undefined && sharedLists.length === 0 ? (
                    <p className="py-2 text-sm text-gray-500">None.</p>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {(sharedLists ?? []).map((sharedList) => (
                        <SharingRow
                          key={sharedList.id}
                          name={sharedList.owner.name}
                          email={sharedList.owner.email}
                          actionLabel="Leave"
                          confirmText="You'll no longer be able to see or edit their list unless they add you again."
                          isWorking={isLeaving}
                          onConfirm={async () => {
                            await leaveList({ ownerId: sharedList.ownerId });
                            await refetchSharedLists();
                            await onLeaveList();
                          }}
                        />
                      ))}
                    </ul>
                  )}
                </section>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
