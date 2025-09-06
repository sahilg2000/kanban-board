"use client";
import { useQuery } from "@apollo/client/react";
import { BoardsListDocument, type BoardsListQuery } from "@/graphql/generated";

export type Board = BoardsListQuery["boards"][number];

export function useBoards() {
    const { data, loading, error } =
        useQuery<BoardsListQuery>(BoardsListDocument);
    return {
        data: data?.boards ?? null,
        loading,
        error: error ? error.message : null,
    };
}
