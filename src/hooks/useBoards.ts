"use client";
import { useSubscription } from "@apollo/client/react";
import {
    BoardsListDocument,
    type BoardsListSubscription,
} from "@/graphql/generated";

export type Board = BoardsListSubscription["boards"][number];

export function useBoards() {
    const { data, loading, error } =
        useSubscription<BoardsListSubscription>(BoardsListDocument);
    return {
        data: data?.boards ?? null,
        loading,
        error: error ? error.message : null,
    };
}
