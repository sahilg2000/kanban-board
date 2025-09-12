import { useParams } from "next/navigation";
import { useBoards, type Board } from "@/hooks/useBoards";
import { ColumnsList } from "@/components/columns/ColumnsList";

export default function BoardByIdPage() {
    const { id } = useParams<{ id: string }>();

    const { data, error, loading } = useBoards(); // subscription-based
    const board = data?.find((b: Board) => b.id === id) ?? null;

    if (error) return <p className="text-red-600">Error: {error}</p>;

    // show content immediately; don't block on subscription 'loading'
    // render name when available; show a lightweight hint meanwhile
    const title = board?.name ?? (loading ? "Loading…" : "Untitled board");

    // if subscription has settled and the board truly doesn't exist
    if (!loading && !board) return <p className="p-6">Not found.</p>;

    return (
        <div className="container max-w-[1400px] px-6 lg:px-8 py-6">
            <h1 className="text-xl font-semibold mb-4">{title}</h1>
            {/* key ensures resubscribe when switching boards from the sidebar */}
            <ColumnsList key={id} boardId={id} />
        </div>
    );
}
