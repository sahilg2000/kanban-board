"use client";
import { useBoards } from "@/hooks/useBoards";
import BoardRow from "@/components/boards/BoardRow";
import NewBoardInline from "@/components/boards/NewBoardInline";
import Link from "next/link";

export default function BoardsPage() {
    const { data, error, loading } = useBoards();

    if (error) return <p>Error: {error}</p>;
    if (loading || !data) return <p>Loading...</p>;

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Boards</h1>
                {/* link to standalone create page */}
                <Link href="/boards/new" className="text-sm underline">
                    New board page
                </Link>
            </div>

            <NewBoardInline />

            <ul className="space-y-2">
                {data.map((b) => (
                    <BoardRow key={b.id} board={b} />
                ))}
            </ul>
        </div>
    );
}
