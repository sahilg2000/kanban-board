"use client";
import { useQuery } from "@apollo/client/react";
import {
    CardsByColumnDocument,
    type CardsByColumnQuery,
    type CardsByColumnQueryVariables,
} from "@/graphql/generated";

export type Card = CardsByColumnQuery["cards"][number];

export function useCards(columnId: string) {
    const { data, loading, error } = useQuery<
        CardsByColumnQuery,
        CardsByColumnQueryVariables
    >(CardsByColumnDocument, { variables: { column_id: columnId } });

    return {
        data: data?.cards ?? [],
        loading,
        error: error ? error.message : null,
    };
}
