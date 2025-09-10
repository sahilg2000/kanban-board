"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    UpdateBoardDocument,
    DeleteBoardDocument,
    BoardsListDocument,
    type BoardsListQuery,
} from "@/graphql/generated";
import DropdownMenu from "@/components/shared/DropdownMenu";
import { Draggable } from "@hello-pangea/dnd";

type Board = BoardsListQuery["boards"][number];

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
                {(provided) => (
                    <li
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                        className="border rounded p-2 bg-white flex gap-2 items-center"
                    >
                        <input
                            className="border rounded px-2 py-1 flex-1"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            autoFocus
                        />
                        <button
                            className="border rounded px-3 py-1"
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
                        <button
                            className="border rounded px-3 py-1"
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
            {(provided) => (
                <li
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="border rounded p-2 bg-white flex items-center justify-between"
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
