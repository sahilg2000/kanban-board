"use client";
import { useSubscription } from "@apollo/client/react";
import {
    GetBoardColumnsDocument,
    type GetBoardColumnsSubscription,
    type GetBoardColumnsSubscriptionVariables,
} from "@/graphql/generated";

export type Column = GetBoardColumnsSubscription["columns"][number];

export function useColumns(boardId: string) {
    const { data, loading, error } = useSubscription<
        GetBoardColumnsSubscription,
        GetBoardColumnsSubscriptionVariables
    >(GetBoardColumnsDocument, { variables: { board_id: boardId } });

    return {
        data: data?.columns ?? null,
        loading,
        error: error ? error.message : null,
    };
}
