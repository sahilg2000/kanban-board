"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    DeleteColumnDocument,
    GetBoardColumnsDocument,
} from "@/graphql/generated";
import type { Column } from "@/hooks/useColumns";
import CardsList from "@/components/cards/CardsList";
// import the SAME reusable dropdown you used for cards:
import DropdownMenu from "@/components/shared/DropdownMenu";
import EditColumn from "./EditColumn";

export default function ColumnCard({
    column,
    boardId,
}: {
    column: Column;
    boardId: string;
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
        <div className="border rounded-xl p-3 bg-white">
            <div className="flex items-start justify-between mb-2">
                <h2 className="font-semibold">{column.name}</h2>
                <DropdownMenu
                    onEdit={() => setEditing(true)}
                    onDelete={() => {
                        void deleteColumn({ variables: { id: column.id } });
                    }}
                />
            </div>
            <CardsList columnId={column.id} />
        </div>
    );
}
