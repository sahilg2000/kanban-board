"use client";
import { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    UpdateColumnInfoDocument,
    GetBoardColumnsDocument,
} from "@/graphql/generated";
import type { Column } from "@/hooks/useColumns";

export default function EditColumn({
    column,
    onDone,
}: {
    column: Column;
    onDone: () => void;
}) {
    const [name, setName] = useState(column.name ?? "");
    const [mutate, { loading, error }] = useMutation(UpdateColumnInfoDocument, {
        refetchQueries: [
            {
                query: GetBoardColumnsDocument,
                variables: { board_id: column.id },
            },
        ],
    });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        await mutate({ variables: { id: column.id, name } });
        onDone();
    }

    return (
        <div className="border rounded-xl p-3 bg-white">
            <form onSubmit={onSubmit} className="space-y-2">
                <input
                    className="w-full border rounded px-2 py-1"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Column name"
                    autoFocus
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
        </div>
    );
}
