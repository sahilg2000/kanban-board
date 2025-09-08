"use client";
import { useColumns, type Column } from "@/hooks/useColumns"; // or useColumn if you renamed it
import CardsList from "@/components/cards/CardsList";

export function ColumnsList({ boardId }: { boardId: string }) {
    const { data, loading, error } = useColumns(boardId); // or useColumn

    if (error) return <p className="text-red-500">Error: {error}</p>;
    if (loading || !data) return <p>Loading columns…</p>;

    return (
        <div className="grid grid-flow-col auto-cols-[320px] gap-4 overflow-x-auto p-2">
            {data.map((col: Column) => (
                <div key={col.id} className="border rounded-xl p-3 bg-white">
                    <h2 className="font-semibold mb-2">{col.name}</h2>
                    <CardsList columnId={col.id} />
                </div>
            ))}
        </div>
    );
}
