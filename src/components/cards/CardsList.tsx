"use client";
import { useCards } from "@/hooks/useCards";
import CardItem from "./CardItem";
import NewCard from "./NewCard";
import { Droppable } from "@hello-pangea/dnd";
import type { CardsByColumnSubscription } from "@/graphql/generated";
type CardRow = CardsByColumnSubscription["cards"][number];

export default function CardsList({
    columnId,
    cards: override,
}: {
    columnId: string;
    cards?: CardRow[];
}) {
    const { data: serverCards, loading, error } = useCards(columnId);
    const cards = override ?? serverCards ?? [];
    if (error) return <div className="text-red-500">Error: {error}</div>;
    if (loading && !override) return <div>Loading cards…</div>;
    const nextPos = cards.length;

    return (
        <Droppable droppableId={columnId} type="CARD">
            {(provided) => (
                <ul
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="space-y-2"
                >
                    {cards.map((c, i) => (
                        <CardItem key={c.id} card={c} index={i} />
                    ))}
                    {provided.placeholder}
                    <NewCard columnId={columnId} nextPosition={nextPos} />
                </ul>
            )}
        </Droppable>
    );
}
