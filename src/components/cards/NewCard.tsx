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
        <li className="rounded-xl border bg-card p-3">
            <form
                onSubmit={onSubmit}
                className="grid grid-cols-[1fr_auto] items-center gap-2"
            >
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-9 min-w-0 w-full rounded-md border border-input bg-background px-3 text-foreground
                                placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2
                                focus-visible:ring-ring"
                    placeholder="New card title"
                />
                <button
                    className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 
                                text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                    disabled={loading}
                >
                    {loading ? "Add…" : "Add"}
                </button>
            </form>
        </li>
    );
}
