import { Dialog, Transition } from "@headlessui/react";
import { UserIcon } from "@heroicons/react/24/outline";
import type { User } from "@prisma/client";
import partial from "lodash-es/partial";
import Image from "next/image";
import React, { Fragment, useCallback, useState } from "react";
import { trpc } from "../utils/trpc";
import { Button } from "./button";

interface IAddReviewModalProps {
  isOpen: boolean;
  closeModal: () => void;
}

export const AddCollaboratorModal = ({
  isOpen,
  closeModal,
}: IAddReviewModalProps) => {
  const [search, setSearch] = useState("");
  const [selectedCollaboratorId, setSelectedCollaboratorId] =
    useState<string>("");
  const { data: searchResults } = trpc.user.search.useQuery(
    { term: search },
    {
      enabled: search.length > 0,
    }
  );
  const { data: allCollaborators, refetch: refetchCollaborators } =
    trpc.collaborator.allOwner.useQuery();
  const { mutateAsync: addCollaborator, isLoading: isAddingCollaborator } =
    trpc.collaborator.add.useMutation();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    []
  );

  const handleSelectCollaborator = useCallback(
    (user: User, event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setSearch(user.name ?? user.email ?? "Unknown");
      setSelectedCollaboratorId(user.id);
    },
    []
  );

  const handleAddCollaborator = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      await addCollaborator({ collaboratorId: selectedCollaboratorId });
      await refetchCollaborators();
      setSearch("");
      closeModal();
    },
    [addCollaborator, closeModal, refetchCollaborators, selectedCollaboratorId]
  );

  const maybeRenderSearchResults = useCallback(() => {
    if (
      searchResults === undefined ||
      searchResults === null ||
      searchResults.length === 0
    ) {
      return null;
    }

    return (
      <>
        <hr className="my-4" />
        <ul className="space-y-4">
          {searchResults.map((user) => {
            const isCollaborator =
              allCollaborators !== undefined &&
              allCollaborators.some(
                (collaborator) => collaborator.collaboratorId === user.id
              );
            return (
              <li className="flex items-center justify-between" key={user.id}>
                <Button
                  onClick={partial(handleSelectCollaborator, user)}
                  variant="ghost"
                  disabled={isCollaborator}
                >
                  <div className="flex h-12 items-center gap-4">
                    {user.image === null ? (
                      <div className="flex h-12 w-12 items-center justify-center rounded-full border-2 border-indigo-400">
                        <UserIcon className="h-6 w-6" />
                      </div>
                    ) : (
                      <Image
                        className="inline-block h-12 w-12 rounded-full ring-2 ring-white"
                        src={user.image}
                        alt="Profile image"
                        width={48}
                        height={48}
                      />
                    )}
                    <div className="flex flex-col">
                      <span className="text-left">{user.name}</span>
                      <span className="text-xs text-indigo-300">
                        {user.email}
                      </span>
                    </div>
                  </div>
                </Button>
                {isCollaborator && (
                  <span className="text-xs text-gray-500">ADDED</span>
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  }, [handleSelectCollaborator, searchResults, allCollaborators]);

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
                <Dialog.Title
                  as="h3"
                  className="text-lg font-medium leading-6 text-gray-900"
                >
                  Add Collaborator
                </Dialog.Title>
                <form className="mt-2 flex space-x-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      className="w-full rounded text-sm"
                      name="collaborator"
                      value={search}
                      onChange={handleChange}
                    />
                  </div>
                  <Button
                    isLoading={isAddingCollaborator}
                    onClick={handleAddCollaborator}
                  >
                    Add
                  </Button>
                </form>
                {maybeRenderSearchResults()}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
