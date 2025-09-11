import { useSubscription } from "@apollo/client/react";
import {
    CardsByColumnDocument,
    type CardsByColumnSubscription,
} from "@/graphql/generated";

export type Card = CardsByColumnSubscription["cards"][number];

export function useCards(columnId: string) {
    const { data, loading, error } = useSubscription(CardsByColumnDocument, {
        variables: { column_id: columnId },
    });

    return {
        data: (data?.cards ?? []) as Card[],
        loading,
        error: error?.message,
    };
}
