"use client";

import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useMutation } from "@apollo/client/react";
import {
    CreateBoardDocument,
    type CreateBoardMutation,
    type CreateBoardMutationVariables,
} from "@/graphql/generated";

export default function NewBoardPage() {
    const [name, setName] = useState<string>("");
    const [err, setErr] = useState<string | null>(null);
    const r = useRouter();
    const [createBoard, { loading }] = useMutation<
        CreateBoardMutation,
        CreateBoardMutationVariables
    >(CreateBoardDocument);

    async function OnCreate(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        try {
            const res = await createBoard({ variables: { name } });
            const id = res.data?.insert_boards_one?.id;
            if (!id) {
                setErr("Create failed");
                return;
            }
            r.push(`/boards/${id}`);
        } catch (e: unknown) {
            const msg = e instanceof Error ? e.message : String(e);
            setErr(msg || "Create failed");
        }
    }

    return (
        <form onSubmit={OnCreate} className="space-y-3">
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Board name"
                className="border px-2 py-1 rounded"
            />
            <button
                type="submit"
                className="border px-3 py-1 rounded"
                disabled={loading}
            >
                {loading ? "Creating..." : "Create"}
            </button>
            {err && <p className="text-red-500">{err}</p>}
        </form>
    );
}
