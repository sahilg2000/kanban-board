"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    DeleteColumnDocument,
    GetBoardColumnsDocument,
} from "@/graphql/generated";
import type { CardsByColumnSubscription } from "@/graphql/generated";
import type { Column } from "@/hooks/useColumns";
import CardsList from "@/components/cards/CardsList";
import DropdownMenu from "@/components/shared/DropdownMenu";
import EditColumn from "./EditColumn";
import { Draggable } from "@hello-pangea/dnd";
import { ScrollArea } from "@/components/ui/scroll-area";

type CardRow = CardsByColumnSubscription["cards"][number];

export default function ColumnCard({
    column,
    boardId,
    index,
    cards,
}: {
    column: Column;
    boardId: string;
    index: number;
    cards: CardRow[];
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
            {(provided, snapshot) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className={`rounded-2xl border bg-card p-3 sm:p-4 transition-shadow
                                focus-within:ring-2 focus-within:ring-ring/40
                                hover:shadow-md ${
                                    snapshot.isDragging ? "shadow-md" : ""
                                }`}
                >
                    <div className="mb-2 flex items-start justify-between gap-2">
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
                    <ScrollArea className="h-[calc(100vh-18rem)] pr-1">
                        <CardsList columnId={column.id} cards={cards} />
                    </ScrollArea>
                </div>
            )}
        </Draggable>
    );
}
