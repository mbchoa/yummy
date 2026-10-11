import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { Like } from "@prisma/client";
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
  const inputRef = useRef<HTMLInputElement>(null);
  const { refetch } = trpc.foodReview.all.useQuery(
    { restaurantId },
    { enabled: !!restaurantId }
  );
  const { mutateAsync: addFoodReview, isLoading: isAddingFoodReview } =
    trpc.foodReview.add.useMutation();
  const trimmedName = name.trim();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    []
  );

  const handleAddFoodReview = useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      if (trimmedName.length === 0) {
        return;
      }
      await addFoodReview({ name: trimmedName, restaurantId, like: Like.LIKE });
      await refetch();
      setName("");
      closeModal();
    },
    [addFoodReview, closeModal, refetch, restaurantId, trimmedName]
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
                    Add Item
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
                <form
                  className="mt-2 flex space-x-4"
                  onSubmit={handleAddFoodReview}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    className="flex-1 rounded text-sm"
                    name="itemName"
                    aria-label="Dish name"
                    placeholder="Double Double Cheeseburger"
                    value={name}
                    onChange={handleChange}
                  />
                  <Button
                    type="submit"
                    isLoading={isAddingFoodReview}
                    disabled={trimmedName.length === 0}
                  >
                    Add
                  </Button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
