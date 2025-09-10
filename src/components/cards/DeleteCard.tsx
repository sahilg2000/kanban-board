"use client";
import { useMutation } from "@apollo/client/react";
import { DeleteCardDocument, CardsByColumnDocument } from "@/graphql/generated";

export default function DeleteCard({
    id,
    columnId,
    onDone,
}: {
    id: string;
    columnId: string;
    onDone?: () => void;
}) {
    const [del, { loading }] = useMutation(DeleteCardDocument, {
        refetchQueries: [
            {
                query: CardsByColumnDocument,
                variables: { column_id: columnId },
            },
        ],
    });

    return (
        <button
            role="menuitem"
            onClick={async () => {
                await del({ variables: { id } });
                onDone?.();
            }}
            disabled={loading}
            className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 disabled:opacity-50"
        >
            Delete
        </button>
    );
}
