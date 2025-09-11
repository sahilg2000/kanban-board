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

export default function NewBoardInline({
    stacked = false,
}: {
    stacked?: boolean;
}) {
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
        <form
            onSubmit={onSubmit}
            className={
                stacked ? "mb-4 space-y-2" : "mb-4 flex items-center gap-2"
            }
        >
            <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New board name"
                className={
                    "h-9 w-full max-w-full min-w-0 block rounded-md border border-input bg-background px-3" +
                    " text-foreground placeholder:text-muted-foreground focus-visible:outline-none" +
                    " focus-visible:ring-2 focus-visible:ring-ring" +
                    (stacked ? "" : "flex-1")
                }
            />
            <button
                className={
                    "inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-primary-foreground " +
                    "hover:bg-primary/90 disabled:opacity-50" +
                    (stacked ? " w-full" : "")
                }
                disabled={loading}
            >
                {loading ? "Adding…" : "Add"}
            </button>
            {err && <p className="ml-2 text-sm text-destructive">{err}</p>}
        </form>
    );
}
