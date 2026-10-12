import { Dialog, Transition } from "@headlessui/react";
import {
  HandThumbDownIcon,
  HandThumbUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { Like } from "@prisma/client";
import classNames from "classnames";
import React, { Fragment, useCallback, useRef, useState } from "react";
import { trpc } from "../utils/trpc";
import { Button } from "./button";

interface IAddReviewModalProps {
  isOpen: boolean;
  closeModal: () => void;
  restaurantId: string;
}

export const AddReviewModal = ({
  isOpen,
  closeModal,
  restaurantId,
}: IAddReviewModalProps) => {
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [like, setLike] = useState<Like>(Like.LIKE);
  const inputRef = useRef<HTMLInputElement>(null);
  const { refetch } = trpc.foodReview.all.useQuery(
    { restaurantId },
    { enabled: !!restaurantId },
  );
  const {
    mutateAsync: addFoodReview,
    isLoading: isAddingFoodReview,
    error: addFoodReviewError,
    reset: resetAddFoodReview,
  } = trpc.foodReview.add.useMutation({
    // the error is shown below the dish name instead
    meta: { skipErrorToast: true },
  });
  const trimmedName = name.trim();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
      resetAddFoodReview();
    },
    [resetAddFoodReview],
  );

  const handleNoteChange = useCallback(
    (event: React.ChangeEvent<HTMLTextAreaElement>) => {
      setNote(event.target.value);
    },
    [],
  );

  const handleAddFoodReview = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (trimmedName.length === 0) {
        return;
      }
      try {
        await addFoodReview({
          name: trimmedName,
          restaurantId,
          like,
          review: note,
        });
      } catch {
        // shown below the dish name
        return;
      }
      await refetch();
      setName("");
      setNote("");
      setLike(Like.LIKE);
      closeModal();
    },
    [addFoodReview, closeModal, like, note, refetch, restaurantId, trimmedName],
  );

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
                    Log a dish
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
                <form className="mt-2 space-y-3" onSubmit={handleAddFoodReview}>
                  <input
                    ref={inputRef}
                    type="text"
                    className="w-full rounded text-sm"
                    name="itemName"
                    aria-label="Dish name"
                    placeholder="Double Double Cheeseburger"
                    value={name}
                    onChange={handleChange}
                    aria-invalid={addFoodReviewError !== null}
                    aria-describedby={
                      addFoodReviewError !== null ? "add-dish-error" : undefined
                    }
                  />
                  {addFoodReviewError !== null && (
                    <p
                      id="add-dish-error"
                      role="alert"
                      className="text-sm text-red-600"
                    >
                      {addFoodReviewError.data?.code === "CONFLICT"
                        ? addFoodReviewError.message
                        : "Couldn't add this dish. Try again."}
                    </p>
                  )}
                  <textarea
                    className="w-full rounded text-sm"
                    name="note"
                    aria-label="Note (optional)"
                    placeholder="Note (optional), e.g. ask for it animal style"
                    rows={3}
                    maxLength={500}
                    value={note}
                    onChange={handleNoteChange}
                  />
                  <div className="flex items-center justify-between">
                    <div
                      className="flex items-center gap-1"
                      role="group"
                      aria-label="Rating"
                    >
                      <button
                        type="button"
                        className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Dislike"
                        aria-pressed={like === Like.DISLIKE}
                        title="Dislike"
                        onClick={() => setLike(Like.DISLIKE)}
                      >
                        <HandThumbDownIcon
                          className={classNames(
                            "h-6 w-6 stroke-slate-600",
                            like === Like.DISLIKE && "fill-red-500",
                          )}
                        />
                      </button>
                      <button
                        type="button"
                        className="rounded-md p-1 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        aria-label="Like"
                        aria-pressed={like === Like.LIKE}
                        title="Like"
                        onClick={() => setLike(Like.LIKE)}
                      >
                        <HandThumbUpIcon
                          className={classNames(
                            "h-6 w-6 stroke-slate-600",
                            like === Like.LIKE && "fill-green-500",
                          )}
                        />
                      </button>
                    </div>
                    <Button
                      type="submit"
                      isLoading={isAddingFoodReview}
                      disabled={trimmedName.length === 0}
                    >
                      Save
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
