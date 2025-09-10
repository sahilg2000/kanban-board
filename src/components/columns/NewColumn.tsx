"use client";
import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    CreateColumnDocument,
    GetBoardColumnsDocument,
} from "@/graphql/generated";

export default function NewColumn({
    boardId,
    nextPosition,
}: {
    boardId: string;
    nextPosition: number;
}) {
    const [name, setName] = useState("");
    const [create, { loading }] = useMutation(CreateColumnDocument, {
        refetchQueries: [
            {
                query: GetBoardColumnsDocument,
                variables: { board_id: boardId },
            },
        ],
    });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        if (!name.trim()) return;
        await create({
            variables: { board_id: boardId, name, position: nextPosition },
        });
        setName("");
    }

    return (
        <div className="border rounded-xl p-3 bg-white">
            <form onSubmit={onSubmit} className="space-y-2">
                <div className="font-semibold">New column</div>
                <input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="border rounded px-2 py-1 w-full"
                    placeholder="Column name"
                />
                <button className="border rounded px-3 py-1" disabled={loading}>
                    {loading ? "Creating..." : "Create"}
                </button>
            </form>
        </div>
    );
}
