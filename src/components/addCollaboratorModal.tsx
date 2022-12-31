import { Dialog, Transition } from "@headlessui/react";
import type { User } from "@prisma/client";
import partial from "lodash-es/partial";
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
  const { mutateAsync: addCollaborator } = trpc.collaborator.add.useMutation();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
    },
    []
  );

  const handleSelectCollaborator = useCallback(
    (user: User, event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      setSearch(`${user.name} <${user.email}>`);
      setSelectedCollaboratorId(user.id);
    },
    []
  );

  const handleAddCollaborator = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      // await addCollaborator({ collaboratorId: selectedCollaboratorId });
      setSearch("");
      closeModal();
    },
    [closeModal]
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
      <ul className="absolute top-full left-0 right-0 space-y-4 bg-white p-4 drop-shadow-xl">
        {searchResults.map((user) => {
          return (
            <li key={user.id}>
              <Button onClick={partial(handleSelectCollaborator, user)}>
                {user.name} &lt;{user.email}&gt;
              </Button>
            </li>
          );
        })}
      </ul>
    );
  }, [handleSelectCollaborator, searchResults]);

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
                  <input
                    type="text"
                    className="flex-1 rounded text-sm"
                    name="collaborator"
                    value={search}
                    onChange={handleChange}
                  />
                  <Button onClick={handleAddCollaborator}>Add</Button>
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
