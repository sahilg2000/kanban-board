"use client";
import { useColumns, type Column } from "@/hooks/useColumns";
import ColumnCard from "./ColumnCard";
import NewColumnCard from "./NewColumn";

export function ColumnsList({ boardId }: { boardId: string }) {
    const { data, loading, error } = useColumns(boardId);

    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (loading || !data) return <p>Loading columns…</p>;

    const nextPos = ((data.at(-1)?.position as number | undefined) ?? 0) + 1000;

    return (
        <div className="grid grid-flow-col auto-cols-[320px] gap-4 overflow-x-auto p-2">
            {data.map((col: Column) => (
                <ColumnCard key={col.id} column={col} boardId={boardId} />
            ))}
            <NewColumnCard boardId={boardId} nextPosition={nextPos} />
        </div>
    );
}
