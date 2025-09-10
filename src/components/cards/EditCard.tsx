"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    UpdateCardInfoDocument,
    CardsByColumnDocument,
} from "@/graphql/generated";
import type { Card } from "@/hooks/useCards";

export default function EditCard({
    card,
    onDone,
}: {
    card: Card;
    onDone: () => void;
}) {
    const [name, setName] = useState(card.name ?? "");
    const [description, setDescription] = useState(card.description ?? "");

    const [updateCard, { loading, error }] = useMutation(
        UpdateCardInfoDocument,
        {
            refetchQueries: [
                {
                    query: CardsByColumnDocument,
                    variables: { column_id: card.column_id },
                },
            ],
        }
    );

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        await updateCard({
            variables: {
                id: card.id,
                name: name || null,
                description: description || null,
            },
        });
        onDone();
    }

    return (
        <li className="border rounded p-2 bg-white">
            <form onSubmit={onSubmit} className="space-y-2">
                <input
                    className="w-full border rounded px-2 py-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Card name"
                    autoFocus
                />
                <textarea
                    className="w-full border rounded px-2 py-1"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Description (optional)"
                    rows={3}
                />
                {error && (
                    <p className="text-red-600 text-sm">
                        Error: {error.message}
                    </p>
                )}
                <div className="flex gap-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="border rounded px-3 py-1"
                    >
                        {loading ? "Saving…" : "Save"}
                    </button>
                    <button
                        type="button"
                        onClick={onDone}
                        className="border rounded px-3 py-1"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </li>
    );
}
