"use client";
import { useState, useEffect } from "react";
import { useColumns, type Column } from "@/hooks/useColumns";
import ColumnCard from "./ColumnCard";
import NewColumnCard from "./NewColumn";
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";
import { useApolloClient } from "@apollo/client/react";
import {
    UpdateCardPositionDocument,
    MoveCardDocument,
    type CardsByColumnSubscription,
    UpdateColumnPositionDocument,
    type GetBoardColumnsSubscription,
} from "@/graphql/generated";
import { reindex } from "@/components/shared/reindex";

type CardRow = CardsByColumnSubscription["cards"][number];
type ColumnRow = GetBoardColumnsSubscription["columns"][number];

export function ColumnsList({ boardId }: { boardId: string }) {
    const { data, loading, error } = useColumns(boardId);
    const client = useApolloClient();
    const [cardsLocal, setCardsLocal] = useState<Record<string, CardRow[]>>({});
    const [colsLocal, setColsLocal] = useState<ColumnRow[]>([]);
    useEffect(() => {
        if (data) setColsLocal(data);
    }, [data]);

    useEffect(() => {
        if (!data) return;
        const m: Record<string, CardRow[]> = {};
        for (const col of data) {
            m[col.id] = (col.cards ?? []).map((c) => ({
                ...c,
                column_id: col.id,
            }));
        }
        setCardsLocal(m);
    }, [data]);

    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (loading || !data) return <p>Loading columns…</p>;

    const nextPos = colsLocal.length;
    const onDragEnd = async ({
        destination,
        source,
        draggableId,
        type,
    }: DropResult) => {
        if (!destination) return;

        // ----- CARDS -----
        if (type === "CARD") {
            const srcCol = source.droppableId;
            const dstCol = destination.droppableId;

            const srcCards = cardsLocal[srcCol] ?? [];
            const dstCards = cardsLocal[dstCol] ?? [];

            if (srcCol === dstCol) {
                const arr = srcCards.slice();
                const [moved] = arr.splice(source.index, 1);
                arr.splice(destination.index, 0, moved);

                const reCards = arr.map((c, i) => ({
                    ...c,
                    position: i,
                    column_id: srcCol,
                }));
                setCardsLocal((prev) => ({ ...prev, [srcCol]: reCards }));

                const changes = diffPositions(reCards, srcCards);

                for (const ch of changes) {
                    await client.mutate({
                        mutation: UpdateCardPositionDocument,
                        variables: { id: ch.id, position: ch.position },
                        optimisticResponse: {
                            __typename: "mutation_root",
                            update_cards_by_pk: {
                                __typename: "cards",
                                id: ch.id,
                                position: ch.position,
                            },
                        },
                    });
                }
            } else {
                const srcArr = srcCards.slice();
                const [moved] = srcArr.splice(source.index, 1);
                const movedPatched = { ...moved, column_id: dstCol };

                const dstArr = dstCards.slice();
                dstArr.splice(destination.index, 0, movedPatched);

                const reSrc = srcArr.map((c, i) => ({
                    ...c,
                    position: i,
                    column_id: srcCol,
                }));
                const reDst = dstArr.map((c, i) => ({
                    ...c,
                    position: i,
                    column_id: dstCol,
                }));

                const newPos = reDst.find(
                    (c) => c.id === draggableId
                )!.position;

                setCardsLocal((prev) => ({
                    ...prev,
                    [srcCol]: reSrc,
                    [dstCol]: reDst,
                }));

                await client.mutate({
                    mutation: MoveCardDocument,
                    variables: {
                        id: draggableId,
                        column_id: dstCol,
                        position: newPos, // <-- use the new position
                    },
                    optimisticResponse: {
                        __typename: "mutation_root",
                        update_cards_by_pk: {
                            __typename: "cards",
                            id: draggableId,
                            column_id: dstCol,
                            position: newPos, // <-- and here too
                        },
                    },
                });

                const dstChanges = diffPositions(
                    reDst.filter((c) => c.id !== draggableId),
                    dstCards
                );
                for (const ch of dstChanges) {
                    await client.mutate({
                        mutation: UpdateCardPositionDocument,
                        variables: { id: ch.id, position: ch.position },
                        optimisticResponse: {
                            __typename: "mutation_root",
                            update_cards_by_pk: {
                                __typename: "cards",
                                id: ch.id,
                                position: ch.position,
                            },
                        },
                    });
                }

                const srcChanges = diffPositions(reSrc, srcCards);
                for (const ch of srcChanges) {
                    await client.mutate({
                        mutation: UpdateCardPositionDocument,
                        variables: { id: ch.id, position: ch.position },
                        optimisticResponse: {
                            __typename: "mutation_root",
                            update_cards_by_pk: {
                                __typename: "cards",
                                id: ch.id,
                                position: ch.position,
                            },
                        },
                    });
                }
            }
            return;
        }

        // ----- COLUMNS -----
        if (type === "COLUMN") {
            const before = colsLocal;
            const arr = before.slice();
            const [moved] = arr.splice(source.index, 1);
            arr.splice(destination.index, 0, moved);

            const reCols = reindex(arr);
            setColsLocal(reCols); // <-- optimistic UI

            const changes = diffColumnPositions(reCols, before);
            for (const ch of changes) {
                await client.mutate({
                    mutation: UpdateColumnPositionDocument,
                    variables: { id: ch.id, position: ch.position },
                    optimisticResponse: {
                        __typename: "mutation_root",
                        update_columns_by_pk: {
                            __typename: "columns",
                            id: ch.id,
                            position: ch.position,
                        },
                    },
                });
            }
        }
    };

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable
                droppableId={boardId}
                type="COLUMN"
                direction="horizontal"
            >
                {(provided) => (
                    <div
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        className="grid grid-flow-col auto-cols-[320px] gap-4 overflow-x-auto p-2"
                    >
                        {colsLocal.map((col: Column, i) => (
                            <ColumnCard
                                key={col.id}
                                column={col}
                                boardId={boardId}
                                index={i}
                                cards={cardsLocal[col.id] ?? col.cards}
                            />
                        ))}
                        {provided.placeholder}
                        <NewColumnCard
                            boardId={boardId}
                            nextPosition={nextPos}
                        />
                    </div>
                )}
            </Droppable>
        </DragDropContext>
    );
}

type MinimalCard = Pick<CardRow, "id" | "position">;

function diffPositions(
    after: ReadonlyArray<MinimalCard>,
    before: ReadonlyArray<MinimalCard>
): Array<MinimalCard> {
    const prev = new Map(
        before.map((c) => [c.id as string, c.position as number])
    );
    const out: Array<{ id: string; position: number }> = [];
    for (const c of after) {
        const p = prev.get(c.id as string);
        if (p === undefined || p !== c.position)
            out.push({ id: c.id as string, position: c.position as number });
    }
    return out;
}

// ---------- columns helpers ----------

function diffColumnPositions(
    after: ColumnRow[],
    before: ColumnRow[]
): Array<{ id: string; position: number }> {
    const prev = new Map(
        before.map((c) => [c.id as string, c.position as number])
    );
    const out: Array<{ id: string; position: number }> = [];
    for (const c of after) {
        const p = prev.get(c.id as string);
        if (p === undefined || p !== c.position)
            out.push({ id: c.id as string, position: c.position as number });
    }
    return out;
}
