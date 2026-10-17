import { Dialog, Transition } from "@headlessui/react";
import { UserIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  CollaboratorRole,
  CollaboratorStatus,
  type User,
} from "@prisma/client";
import partial from "lodash-es/partial";
import Image from "next/image";
import classNames from "classnames";
import React, { Fragment, useCallback, useRef, useState } from "react";
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
  const [role, setRole] = useState<CollaboratorRole>(CollaboratorRole.EDITOR);
  const inputRef = useRef<HTMLInputElement>(null);
  // the server ignores searches shorter than this
  const isSearchTooShort = search.replace(/\s/g, "").length < 3;
  const { data: searchResults, isFetching: isSearching } =
    trpc.user.search.useQuery(
      { term: search },
      {
        enabled: !isSearchTooShort,
      },
    );
  const { data: allCollaborators, refetch: refetchCollaborators } =
    trpc.collaborator.all.useQuery();
  const { mutateAsync: addCollaborator, isLoading: isAddingCollaborator } =
    trpc.collaborator.add.useMutation();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setSearch(event.target.value);
      setSelectedCollaboratorId("");
    },
    [],
  );

  const handleSelectCollaborator = useCallback(
    (
      user: Pick<User, "id" | "name" | "email">,
      event: React.MouseEvent<HTMLButtonElement>,
    ) => {
      event.preventDefault();
      setSearch(user.name ?? user.email ?? "Unknown");
      setSelectedCollaboratorId(user.id);
    },
    [],
  );

  const handleAddCollaborator = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (selectedCollaboratorId === "") {
        return;
      }
      await addCollaborator({ collaboratorId: selectedCollaboratorId, role });
      await refetchCollaborators();
      setSearch("");
      setRole(CollaboratorRole.EDITOR);
      closeModal();
    },
    [
      addCollaborator,
      closeModal,
      refetchCollaborators,
      role,
      selectedCollaboratorId,
    ],
  );

  const maybeRenderSearchResults = useCallback(() => {
    if (isSearchTooShort) {
      if (search.length === 0 || selectedCollaboratorId !== "") {
        return null;
      }
      return (
        <p className="mt-4 text-sm text-gray-500">
          Type at least 3 characters to search.
        </p>
      );
    }

    if (searchResults === undefined || searchResults === null) {
      return null;
    }

    if (searchResults.length === 0) {
      if (isSearching) {
        return null;
      }
      return (
        <p className="mt-4 text-sm text-gray-500">
          No users match &ldquo;{search}&rdquo;.
        </p>
      );
    }

    return (
      <>
        <hr className="my-4" />
        <ul className="space-y-4">
          {searchResults.map((user) => {
            const existingCollaborator = allCollaborators?.find(
              (collaborator) => collaborator.collaboratorId === user.id,
            );
            const isCollaborator = existingCollaborator !== undefined;
            const isSelected = user.id === selectedCollaboratorId;
            return (
              <li
                className={classNames(
                  "flex items-center justify-between rounded-md",
                  isSelected && "bg-indigo-50 ring-2 ring-indigo-500",
                )}
                key={user.id}
              >
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
                  <span className="text-xs text-gray-500">
                    {existingCollaborator.status === CollaboratorStatus.PENDING
                      ? "INVITED"
                      : "ADDED"}
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </>
    );
  }, [
    handleSelectCollaborator,
    searchResults,
    allCollaborators,
    isSearching,
    isSearchTooShort,
    search,
    selectedCollaboratorId,
  ]);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-10"
        onClose={closeModal}
        initialFocus={inputRef}
      >
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
                    Invite to your list
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
                <p className="mt-1 text-sm text-gray-500">
                  Search for someone who has signed in before, by name or email.
                  They&apos;ll see an invite, and get access once they accept.
                </p>
                <form
                  className="mt-4 space-y-3"
                  onSubmit={handleAddCollaborator}
                >
                  <div>
                    <input
                      ref={inputRef}
                      type="text"
                      className="w-full rounded text-sm outline-indigo-500"
                      name="collaborator"
                      aria-label="Search users by name or email"
                      placeholder="Name or email"
                      autoComplete="off"
                      value={search}
                      onChange={handleChange}
                    />
                  </div>
                  {/* between the search box and the invite button, so the
                  results read top to bottom */}
                  {maybeRenderSearchResults()}
                  <div className="flex items-center gap-3">
                    <label className="min-w-0 flex-1">
                      <span className="sr-only">Role</span>
                      <select
                        className="w-full rounded text-sm"
                        value={role}
                        onChange={(event) =>
                          setRole(event.target.value as CollaboratorRole)
                        }
                      >
                        <option value={CollaboratorRole.EDITOR}>
                          Editor: can add and change
                        </option>
                        <option value={CollaboratorRole.VIEWER}>
                          Viewer: can only look
                        </option>
                      </select>
                    </label>
                    <Button
                      type="submit"
                      isLoading={isAddingCollaborator}
                      disabled={selectedCollaboratorId === ""}
                    >
                      Send invite
                    </Button>
                  </div>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
