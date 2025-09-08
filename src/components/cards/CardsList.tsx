"use client";
import { useCards } from "@/hooks/useCards";
import CardItem from "./CardItem";

export default function CardsList({ columnId }: { columnId: string }) {
    const { data: cards, loading, error } = useCards(columnId);

    if (error) return <div className="text-red-500">Error: {error}</div>;
    if (loading) return <div>Loading cards…</div>;
    if (!cards.length)
        return <div className="text-sm text-gray-500 italic">No cards</div>;

    return (
        <ul className="space-y-2">
            {cards.map((c) => (
                <CardItem key={c.id} card={c} />
            ))}
        </ul>
    );
}
