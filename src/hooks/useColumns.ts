"use client";
import { useQuery } from "@apollo/client/react";
import {
    GetBoardColumnsDocument,
    type GetBoardColumnsQuery,
    type GetBoardColumnsQueryVariables,
} from "@/graphql/generated";

export type Column = GetBoardColumnsQuery["columns"][number];

export function useColumns(boardId: string) {
    const { data, loading, error } = useQuery<
        GetBoardColumnsQuery,
        GetBoardColumnsQueryVariables
    >(GetBoardColumnsDocument, { variables: { board_id: boardId } });

    return {
        data: data?.columns ?? null,
        loading,
        error: error ? error.message : null,
    };
}
