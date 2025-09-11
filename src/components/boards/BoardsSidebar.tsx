// src/components/boards/BoardsSidebar.tsx
"use client";

import { useEffect, useState } from "react";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useApolloClient } from "@apollo/client/react";
import { useBoards } from "@/hooks/useBoards";
import NewBoardInline from "@/components/boards/NewBoardInline";
import BoardRow from "@/components/boards/BoardRow";
import {
    UpdateBoardPositionDocument,
    type BoardsListSubscription,
} from "@/graphql/generated";

type Board = BoardsListSubscription["boards"][number];

export default function BoardsSidebar() {
    const { data, error, loading } = useBoards(); // live list (subscription)
    const client = useApolloClient();

    const [boards, setBoards] = useState<Board[]>([]);
    useEffect(() => {
        if (data) setBoards(data);
    }, [data]);

    if (error) {
        return (
            <div className="px-6 lg:px-8 py-6 text-sm text-red-600">
                Error: {String(error)}
            </div>
        );
    }

    const onDragEnd = async ({ destination, source, type }: DropResult) => {
        if (!destination || type !== "BOARD") return;
        if (!boards.length) return;

        const arr = boards.slice();
        const [moved] = arr.splice(source.index, 1);
        arr.splice(destination.index, 0, moved);

        const reBoards = reindexBoards(arr);
        setBoards(reBoards);

        const changes = diffBoardPositions(reBoards, boards);
        for (const ch of changes) {
            await client.mutate({
                mutation: UpdateBoardPositionDocument,
                variables: { id: ch.id, position: ch.position },
                optimisticResponse: {
                    __typename: "mutation_root",
                    update_boards_by_pk: {
                        __typename: "boards",
                        id: ch.id,
                        position: ch.position,
                    },
                },
            });
        }
    };

    return (
        <div className="px-6 lg:px-8 py-6 min-w-0">
            <h1 className="text-xl font-semibold mb-4">Boards</h1>

            <div className="mb-4">
                <NewBoardInline stacked />
            </div>

            {loading && !boards.length ? (
                <p className="text-sm text-gray-500">Loading...</p>
            ) : null}

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                    droppableId="boards-sidebar"
                    type="BOARD"
                    direction="vertical"
                >
                    {(drop) => (
                        <ul
                            ref={drop.innerRef}
                            {...drop.droppableProps}
                            className="space-y-2"
                        >
                            {boards.map((b, i) => (
                                <BoardRow key={b.id} board={b} index={i} />
                            ))}
                            {drop.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

// ----- helpers (same as /boards/page.tsx) -----
function reindexBoards(items: ReadonlyArray<Board>): Board[] {
    return items.map((it, i) => ({ ...it, position: i }));
}
function diffBoardPositions(
    after: Board[],
    before: Board[]
): Array<{ id: string; position: number }> {
    const prev = new Map(
        before.map((b) => [String(b.id), (b.position ?? -1) as number])
    );
    const out: Array<{ id: string; position: number }> = [];
    for (const b of after) {
        const p = prev.get(String(b.id));
        const cur = (b.position ?? -1) as number;
        if (p === undefined || p !== cur)
            out.push({ id: String(b.id), position: cur });
    }
    return out;
}
