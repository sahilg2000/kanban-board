// ensure this is EXACTLY what you query & type
import { useQuery } from "@apollo/client/react";
import {
    CardsByColumnDocument,
    type CardsByColumnQuery,
} from "@/graphql/generated";

export type Card = CardsByColumnQuery["cards"][number];

export function useCards(columnId: string) {
    const { data, loading, error } = useQuery(CardsByColumnDocument, {
        variables: { column_id: columnId },
        fetchPolicy: "cache-and-network",
    });

    return {
        data: (data?.cards ?? []) as Card[],
        loading,
        error: error?.message,
    };
}
