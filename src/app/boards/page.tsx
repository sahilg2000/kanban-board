"use client";
import { useBoards } from "@/hooks/useBoards";
import type { Board } from "@/hooks/useBoards";

export default function BoardsPage() {
    const { data, error, loading } = useBoards();
    if (error) return <p>Error: {error}</p>;
    if (loading || !data) return <p>Loading...</p>;
    return (
        <ul>
            {data.map(
                (
                    b: Board // type b
                ) => (
                    <li key={b.id}>
                        <a href={`/boards/${b.id}`}>{b.name}</a>
                    </li>
                )
            )}
        </ul>
    );
}
