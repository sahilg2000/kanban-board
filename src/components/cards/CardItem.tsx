"use client";
import type { Card } from "@/hooks/useCards";
import CardDropdownMenu from "../shared/DropdownMenu";
import { useMutation } from "@apollo/client/react";
import { DeleteCardDocument, CardsByColumnDocument } from "@/graphql/generated";
import { useState } from "react";
import EditCard from "./EditCard";

export default function CardItem({ card }: { card: Card }) {
    const [editing, setEditing] = useState(false);

    const [del] = useMutation(DeleteCardDocument, {
        refetchQueries: [
            {
                query: CardsByColumnDocument,
                variables: { column_id: card.column_id },
            },
        ],
    });

    if (editing) {
        return <EditCard card={card} onDone={() => setEditing(false)} />;
    }

    return (
        <li className="border rounded p-2 bg-white">
            <div className="flex items-start justify-between gap-2">
                <h3 className="font-medium text-sm leading-5">{card.name}</h3>
                <CardDropdownMenu
                    onEdit={() => setEditing(true)}
                    onDelete={async () => {
                        await del({ variables: { id: card.id } });
                    }}
                />
            </div>
            {card.description ? (
                <p className="mt-1 text-xs text-gray-600">{card.description}</p>
            ) : null}
        </li>
    );
}
