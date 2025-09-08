"use client";
import { useParams } from "next/navigation";
import { useBoards, type Board } from "@/hooks/useBoards";
import { ColumnsList } from "@/components/columns/ColumnsList";

export default function BoardByIdPage() {
    const { id } = useParams<{ id: string }>();
    const { data, error, loading } = useBoards();
    const board = data?.find((b: Board) => b.id === id);

    if (error) return <p>Error: {error}</p>;
    if (loading) return <p>Loading ...</p>;
    if (!board) return <p>Not found.</p>;
    return (
        <div className="p-4">
            <h1 className="text-xl font-semibold mb-4">{board.name}</h1>
            <ColumnsList boardId={id} />
        </div>
    );
}
