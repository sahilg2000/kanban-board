"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import { CreateCardDocument, CardsByColumnDocument } from "@/graphql/generated";

export default function NewCard({
    columnId,
    nextPosition,
}: {
    columnId: string;
    nextPosition: number;
}) {
    const [name, setName] = useState("");
    const [create, { loading }] = useMutation(CreateCardDocument, {
        refetchQueries: [
            {
                query: CardsByColumnDocument,
                variables: { column_id: columnId },
            },
        ],
    });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        await create({
            variables: {
                column_id: columnId,
                name,
                position: nextPosition,
                description: null,
            },
        });
        setName("");
    }

    return (
        <li className="border rounded p-2">
            <form
                onSubmit={onSubmit}
                className="grid grid-cols-[1fr_auto] gap-2 items-center"
            >
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="min-w-0 w-full border rounded px-2 py-1"
                    placeholder="New card title"
                />
                <button className="border rounded px-3 py-1" disabled={loading}>
                    {loading ? "Add…" : "Add"}
                </button>
            </form>
        </li>
    );
}
