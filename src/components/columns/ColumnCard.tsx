// src/components/columns/ColumnCard.tsx
"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    DeleteColumnDocument,
    GetBoardColumnsDocument,
} from "@/graphql/generated";
import type { Column } from "@/hooks/useColumns";
import CardsList from "@/components/cards/CardsList";
import DropdownMenu from "@/components/shared/DropdownMenu";
import EditColumn from "./EditColumn";
import { Draggable } from "@hello-pangea/dnd";

export default function ColumnCard({
    column,
    boardId,
    index,
}: {
    column: Column;
    boardId: string;
    index: number;
}) {
    const [editing, setEditing] = useState(false);

    const [deleteColumn] = useMutation(DeleteColumnDocument, {
        refetchQueries: [
            {
                query: GetBoardColumnsDocument,
                variables: { board_id: boardId },
            },
        ],
    });

    if (editing) {
        return <EditColumn column={column} onDone={() => setEditing(false)} />;
    }

    return (
        <Draggable draggableId={column.id} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="border rounded-xl p-3 bg-white"
                >
                    <div className="flex items-start justify-between mb-2">
                        <h2 className="font-semibold">{column.name}</h2>
                        <DropdownMenu
                            onEdit={() => setEditing(true)}
                            onDelete={() => {
                                void deleteColumn({
                                    variables: { id: column.id },
                                });
                            }}
                        />
                    </div>
                    <CardsList columnId={column.id} />
                </div>
            )}
        </Draggable>
    );
}
