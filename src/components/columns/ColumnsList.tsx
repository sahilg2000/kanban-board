"use client";
import { useColumns, type Column } from "@/hooks/useColumns";
import ColumnCard from "./ColumnCard";
import NewColumnCard from "./NewColumn";
import { DragDropContext, type DropResult, Droppable } from "@hello-pangea/dnd";
import { useApolloClient } from "@apollo/client/react";
import {
    CardsByColumnDocument,
    UpdateCardPositionDocument,
    MoveCardDocument,
    type CardsByColumnQuery,
    GetBoardColumnsDocument,
    UpdateColumnPositionDocument,
    type GetBoardColumnsQuery,
} from "@/graphql/generated";
import { reindex } from "@/components/shared/reindex";

type CardRow = CardsByColumnQuery["cards"][number];
type ColumnRow = GetBoardColumnsQuery["columns"][number];
type Client = ReturnType<typeof useApolloClient>;

export function ColumnsList({ boardId }: { boardId: string }) {
    const { data, loading, error } = useColumns(boardId);
    const client = useApolloClient();

    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (loading || !data) return <p>Loading columns…</p>;

    const nextPos = data.length;

    const onDragEnd = async ({
        destination,
        source,
        draggableId,
        type,
    }: DropResult) => {
        if (!destination) return;

        // -------- CARDS (integer reindex) --------
        if (type === "CARD") {
            const srcCol = source.droppableId;
            const dstCol = destination.droppableId;

            const beforeSrc = readCards(client, srcCol);
            const beforeDst =
                srcCol === dstCol ? beforeSrc : readCards(client, dstCol);

            const srcArr = [...beforeSrc];
            const dstArr = srcCol === dstCol ? srcArr : [...beforeDst];

            const [moved] = srcArr.splice(source.index, 1);
            const movedPatched: CardRow =
                srcCol === dstCol ? moved : { ...moved, column_id: dstCol };
            dstArr.splice(destination.index, 0, movedPatched);

            const reSrc = reindex(srcArr);
            const reDst = reindex(dstArr);

            writeCards(client, srcCol, reSrc);
            writeCards(client, dstCol, reDst);

            if (srcCol === dstCol) {
                await persistSameColumn(client, reSrc, beforeSrc);
            } else {
                await persistCrossColumn(client, {
                    srcCol,
                    dstCol,
                    movedId: draggableId,
                    reSrc,
                    reDst,
                    beforeSrc,
                    beforeDst,
                });
            }
            return;
        }

        // -------- COLUMNS (integer reindex) --------
        if (type === "COLUMN") {
            const before = readColumns(client, boardId);
            const arr = [...before];
            const [moved] = arr.splice(source.index, 1);
            arr.splice(destination.index, 0, moved);

            const reCols = reindex(arr);

            writeColumns(client, boardId, reCols);
            await persistColumnPositions(client, reCols, before);
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
                        {data.map((col: Column, i) => (
                            <ColumnCard
                                key={col.id}
                                column={col}
                                boardId={boardId}
                                index={i}
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

// ---------- cards helpers ----------
function readCards(client: Client, column_id: string): CardRow[] {
    const res = client.readQuery<CardsByColumnQuery>({
        query: CardsByColumnDocument,
        variables: { column_id },
    });
    return res?.cards ?? [];
}
function writeCards(client: Client, column_id: string, cards: CardRow[]): void {
    client.writeQuery<CardsByColumnQuery>({
        query: CardsByColumnDocument,
        variables: { column_id },
        data: { cards },
    });
}
function diffPositions(
    after: CardRow[],
    before: CardRow[]
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
async function persistSameColumn(
    client: Client,
    after: CardRow[],
    before: CardRow[]
) {
    const changes = diffPositions(after, before);
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
}
async function persistCrossColumn(
    client: Client,
    params: {
        srcCol: string;
        dstCol: string;
        movedId: string;
        reSrc: CardRow[];
        reDst: CardRow[];
        beforeSrc: CardRow[];
        beforeDst: CardRow[];
    }
) {
    const { dstCol, movedId, reSrc, reDst, beforeSrc, beforeDst } = params;

    const movedNow = reDst.find((c) => c.id === movedId)!;
    await client.mutate({
        mutation: MoveCardDocument,
        variables: {
            id: movedId,
            column_id: dstCol,
            position: movedNow.position,
        },
        optimisticResponse: {
            __typename: "mutation_root",
            update_cards_by_pk: {
                __typename: "cards",
                id: movedId,
                column_id: dstCol,
                position: movedNow.position,
            },
        },
    });

    const dstChanges = diffPositions(
        reDst.filter((c) => c.id !== movedId),
        beforeDst
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

    const srcChanges = diffPositions(reSrc, beforeSrc);
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

// ---------- columns helpers ----------
function readColumns(client: Client, board_id: string): ColumnRow[] {
    const res = client.readQuery<GetBoardColumnsQuery>({
        query: GetBoardColumnsDocument,
        variables: { board_id },
    });
    return res?.columns ?? [];
}
function writeColumns(
    client: Client,
    board_id: string,
    columns: ColumnRow[]
): void {
    client.writeQuery<GetBoardColumnsQuery>({
        query: GetBoardColumnsDocument,
        variables: { board_id },
        data: { columns },
    });
}
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
async function persistColumnPositions(
    client: Client,
    after: ColumnRow[],
    before: ColumnRow[]
) {
    const changes = diffColumnPositions(after, before);
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
