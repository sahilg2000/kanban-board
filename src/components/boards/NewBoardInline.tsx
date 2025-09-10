"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import {
    CreateBoardDocument,
    BoardsListDocument,
    type CreateBoardMutation,
    type CreateBoardMutationVariables,
} from "@/graphql/generated";

export default function NewBoardInline() {
    const r = useRouter();
    const [name, setName] = useState("");
    const [err, setErr] = useState<string | null>(null);
    const [createBoard, { loading }] = useMutation<
        CreateBoardMutation,
        CreateBoardMutationVariables
    >(CreateBoardDocument, {
        refetchQueries: [{ query: BoardsListDocument }],
    });

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        setErr(null);
        if (!name.trim()) return;
        try {
            const res = await createBoard({ variables: { name } });
            const id = res.data?.insert_boards_one?.id;
            if (!id) return setErr("Create failed");
            setName("");
            r.push(`/boards/${id}`);
        } catch (e: unknown) {
            setErr(e instanceof Error ? e.message : String(e));
        }
    }

    return (
        <form onSubmit={onSubmit} className="flex gap-2">
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New board name"
                className="border rounded px-2 py-1"
            />
            <button className="border rounded px-3 py-1" disabled={loading}>
                {loading ? "Adding…" : "Add"}
            </button>
            {err && <p className="text-red-500 text-sm ml-2">{err}</p>}
        </form>
    );
}
