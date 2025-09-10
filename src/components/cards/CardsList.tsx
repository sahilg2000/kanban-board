"use client";
import { useCards } from "@/hooks/useCards";
import CardItem from "./CardItem";
import NewCard from "./NewCard";

export default function CardsList({ columnId }: { columnId: string }) {
    const { data: cards, loading, error } = useCards(columnId);

    if (error) return <div className="text-red-500">Error: {error}</div>;
    if (loading) return <div>Loading cards…</div>;

    const nextPos =
        ((cards.at(-1)?.position as number | undefined) ?? 0) + 1000;

    return (
        <ul className="space-y-2">
            {cards.map((c) => (
                <CardItem key={c.id} card={c} />
            ))}
            <NewCard columnId={columnId} nextPosition={nextPos} />
        </ul>
    );
}
