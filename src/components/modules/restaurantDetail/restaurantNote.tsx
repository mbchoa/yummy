import { useState } from "react";
import { trpc } from "../../../utils/trpc";
import { Button } from "../../button";

interface IRestaurantNoteProps {
  restaurantId: string;
  note: string | null;
  // viewers see the note but can't change it
  canEdit: boolean;
  onSaved: () => Promise<unknown>;
}

// one note about a saved restaurant, e.g. who recommended it
export const RestaurantNote = ({
  restaurantId,
  note,
  canEdit,
  onSaved,
}: IRestaurantNoteProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [draft, setDraft] = useState("");
  const { mutateAsync: setNote, isLoading: isSaving } =
    trpc.favoriteRestaurant.setNote.useMutation();

  if (isEditing) {
    return (
      <form
        className="space-y-2"
        onSubmit={async (event) => {
          event.preventDefault();
          await setNote({ id: restaurantId, note: draft });
          await onSaved();
          setIsEditing(false);
        }}
      >
        <textarea
          className="w-full rounded text-sm"
          aria-label="Note about this restaurant"
          placeholder="e.g. Sam recommended it, get the khao soi"
          rows={3}
          maxLength={500}
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          autoFocus
        />
        <div className="flex gap-2">
          <Button size="sm" type="submit" isLoading={isSaving}>
            Save
          </Button>
          <Button
            size="sm"
            variant="ghost"
            type="button"
            onClick={() => setIsEditing(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div className="space-y-1">
      {note !== null && (
        <p className="whitespace-pre-line text-gray-700">{note}</p>
      )}
      {canEdit && (
        <button
          type="button"
          className="text-sm text-indigo-600 hover:underline"
          onClick={() => {
            setDraft(note ?? "");
            setIsEditing(true);
          }}
        >
          {note !== null ? "Edit note" : "Add a note"}
        </button>
      )}
    </div>
  );
};
