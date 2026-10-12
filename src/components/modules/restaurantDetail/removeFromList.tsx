import React, { useState } from "react";
import { Button } from "../../button";

interface IRemoveFromListProps {
  // undefined while the dishes are still loading
  dishCount: number | undefined;
  isRemoving: boolean;
  onRemove: () => Promise<void>;
  // shown above the remove button until the user starts confirming
  prompt?: React.ReactNode;
}

export const RemoveFromList = ({
  dishCount,
  isRemoving,
  onRemove,
  prompt,
}: IRemoveFromListProps) => {
  const [isConfirming, setIsConfirming] = useState(false);

  if (isConfirming) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-gray-700">
          {dishCount === 0
            ? "Remove it from your list?"
            : `Remove it from your list, along with ${
                dishCount === undefined
                  ? "any dishes"
                  : `the ${dishCount} ${dishCount === 1 ? "dish" : "dishes"}`
              } you logged there? This can't be undone.`}
        </p>
        <div className="flex gap-2">
          <Button size="sm" isLoading={isRemoving} onClick={onRemove}>
            Remove
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
    );
  }

  return (
    <div className="space-y-3">
      {prompt}
      <Button
        size="sm"
        variant="outlined"
        onClick={() => setIsConfirming(true)}
      >
        Remove from my list
      </Button>
    </div>
  );
};
