import { Dialog, Transition } from "@headlessui/react";
import { Like } from "@prisma/client";
import React, { Fragment, useCallback, useState } from "react";
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
  const { refetch } = trpc.foodReview.all.useQuery({ restaurantId });
  const { mutateAsync: addFoodReview } = trpc.foodReview.add.useMutation();
  const handleChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setName(event.target.value);
    },
    []
  );

  const handleAddFoodReview = useCallback(
    async (event: React.MouseEvent<HTMLButtonElement>) => {
      event.preventDefault();
      await addFoodReview({ name, restaurantId, like: Like.LIKE });
      await refetch();
      setName("");
      closeModal();
    },
    [addFoodReview, closeModal, name, refetch, restaurantId]
  );

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
                  Add Item
                </Dialog.Title>
                <form className="mt-2 flex space-x-4">
                  <input
                    type="text"
                    className="flex-1 rounded text-sm"
                    name="itemName"
                    placeholder="Double Double Cheeseburger"
                    value={name}
                    onChange={handleChange}
                  />
                  <Button onClick={handleAddFoodReview}>Add</Button>
                </form>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};
