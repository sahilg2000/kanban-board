"use client";
import { useParams } from "next/navigation";
import { useBoards } from "@/hooks/useBoards";
import type { Board } from "@/hooks/useBoards";

export default function BoardPage() {
    const { id } = useParams<{ id: string }>();
    const { data, error, loading } = useBoards();
    const board = data?.find((b: Board) => b.id === id);

    if (error) return <p>Error: {error}</p>;
    if (loading) return <p>Loading ...</p>;
    if (!board) return <p>Not found.</p>;
    return (
        <div>
            <h1>{board.name}</h1>
            {/* Space for upcoming column cards*/}
        </div>
    );
}
