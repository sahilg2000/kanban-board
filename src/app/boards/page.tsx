// src/app/boards/page.tsx
"use client";
import { DragDropContext, Droppable, type DropResult } from "@hello-pangea/dnd";
import { useApolloClient } from "@apollo/client/react";
import { useBoards } from "@/hooks/useBoards";
import BoardRow from "@/components/boards/BoardRow";
import NewBoardInline from "@/components/boards/NewBoardInline";
import {
    BoardsListDocument,
    UpdateBoardPositionDocument,
    type BoardsListQuery,
} from "@/graphql/generated";

type Board = BoardsListQuery["boards"][number];
type Client = ReturnType<typeof useApolloClient>;

export default function BoardsPage() {
    const { data, error, loading } = useBoards();
    const client = useApolloClient();

    if (error) return <p>Error: {error}</p>;
    if (loading || !data) return <p>Loading...</p>;

    const onDragEnd = async ({ destination, source, type }: DropResult) => {
        if (!destination || type !== "BOARD") return;

        const before = readBoards(client);
        const arr = [...before];
        const [moved] = arr.splice(source.index, 1);
        arr.splice(destination.index, 0, moved);

        const reBoards = reindexBoards(arr);

        writeBoards(client, reBoards);
        await persistBoardPositions(client, reBoards, before);
    };

    return (
        <div className="space-y-4">
            <h1 className="text-xl font-semibold">Boards</h1>
            <NewBoardInline />

            <DragDropContext onDragEnd={onDragEnd}>
                <Droppable
                    droppableId="boards"
                    type="BOARD"
                    direction="vertical"
                >
                    {(provided) => (
                        <ul
                            ref={provided.innerRef}
                            {...provided.droppableProps}
                            className="space-y-2"
                        >
                            {data.map((b, i) => (
                                <BoardRow key={b.id} board={b} index={i} />
                            ))}
                            {provided.placeholder}
                        </ul>
                    )}
                </Droppable>
            </DragDropContext>
        </div>
    );
}

function readBoards(client: Client): Board[] {
    const res = client.readQuery<BoardsListQuery>({
        query: BoardsListDocument,
    });
    return res?.boards ?? [];
}
function writeBoards(client: Client, boards: Board[]): void {
    client.writeQuery<BoardsListQuery>({
        query: BoardsListDocument,
        data: { boards },
    });
}

// ----- integer reindex, typed for optional/null position -----
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
async function persistBoardPositions(
    client: Client,
    after: Board[],
    before: Board[]
) {
    const changes = diffBoardPositions(after, before);
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
}
