"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    UpdateBoardDocument,
    DeleteBoardDocument,
    BoardsListDocument,
    type BoardsListSubscription,
} from "@/graphql/generated";
import DropdownMenu from "@/components/shared/DropdownMenu";
import { Draggable } from "@hello-pangea/dnd";

type Board = BoardsListSubscription["boards"][number];

export default function BoardRow({
    board,
    index,
}: {
    board: Board;
    index: number;
}) {
    const [editing, setEditing] = useState(false);
    const [name, setName] = useState(board.name);

    const [updateBoard, { loading: saving }] = useMutation(
        UpdateBoardDocument,
        {
            refetchQueries: [{ query: BoardsListDocument }],
        }
    );

    const [deleteBoard] = useMutation(DeleteBoardDocument, {
        refetchQueries: [{ query: BoardsListDocument }],
    });

    if (editing) {
        return (
            <Draggable draggableId={board.id} index={index}>
                {(provided, snapshot) => (
                    <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className={`flex items-center gap-2 rounded-xl border bg-card p-3 transition-shadow
                            focus-within:ring-2 focus-within:ring-ring/40
                            hover:shadow-md ${
                                snapshot.isDragging ? "shadow-md" : ""
                            }`}
                    >
                        <input
                            className="h-9 w-full flex-1 rounded-md border border-input bg-background px-3 
                            text-foreground placeholder:text-muted-foreground 
                            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <button // Save Button
                            className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 
                            text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                            onClick={async () => {
                                await updateBoard({
                                    variables: { id: board.id, name },
                                });
                                setEditing(false);
                            }}
                            disabled={saving}
                        >
                            {saving ? "Saving…" : "Save"}
                        </button>
                        <button // Cancel Button
                            className="inline-flex h-9 items-center justify-center rounded-md border bg-secondary px-3 text-secondary-foreground hover:bg-secondary/80"
                            onClick={() => {
                                setName(board.name);
                                setEditing(false);
                            }}
                        >
                            Cancel
                        </button>
                    </li>
                )}
            </Draggable>
        );
    }

    return (
        <Draggable draggableId={board.id} index={index}>
            {(provided, snapshot) => (
                <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`flex items-center justify-between rounded-xl border bg-card p-3 transition-shadow
            cursor-grab active:cursor-grabbing
            focus-within:ring-2 focus-within:ring-ring/40
            hover:shadow-md ${snapshot.isDragging ? "shadow-md" : ""}`}
                >
                    <a href={`/boards/${board.id}`} className="font-medium">
                        {board.name}
                    </a>
                    <DropdownMenu
                        onEdit={() => setEditing(true)}
                        onDelete={() => {
                            void deleteBoard({ variables: { id: board.id } });
                        }}
                    />
                </li>
            )}
        </Draggable>
    );
}
