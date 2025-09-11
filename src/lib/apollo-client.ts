// src/lib/apollo-client.ts
"use client";

import {
    ApolloClient,
    InMemoryCache,
    HttpLink,
    split,
    ApolloLink,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { getMainDefinition } from "@apollo/client/utilities";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { createClient } from "graphql-ws";
import type {
    DefinitionNode,
    OperationDefinitionNode,
    DocumentNode,
} from "graphql";
import { nhost } from "@/lib/nhost";

const httpUrl = process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL as string;
const httpLink = new HttpLink({ uri: httpUrl });

const authLink = setContext(async (_, { headers }) => {
    const token = await nhost.auth.getAccessToken();
    return {
        headers: {
            ...(headers || {}),
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
    };
});

const authedHttp = authLink.concat(httpLink);

// ----- derive WS url from HTTP url (guaranteed same host) -----
const wsUrl =
    typeof window !== "undefined" && httpUrl
        ? httpUrl.replace(/^http/i, "ws")
        : undefined;

let link: ApolloLink = authedHttp;

if (wsUrl) {
    const wsLink = new GraphQLWsLink(
        createClient({
            url: wsUrl,
            lazy: true,
            retryAttempts: 5,
            connectionParams: async () => {
                const token = await nhost.auth.getAccessToken();
                return token
                    ? { headers: { Authorization: `Bearer ${token}` } }
                    : { headers: { "x-hasura-role": "anonymous" } };
            },
        })
    );

    link = split(
        (op: { query: DocumentNode }) => {
            const def = getMainDefinition(op.query) as DefinitionNode;
            return (
                def.kind === "OperationDefinition" &&
                (def as OperationDefinitionNode).operation === "subscription"
            );
        },
        wsLink as unknown as ApolloLink, // unify types under pnpm
        authedHttp
    );
}

export const client = new ApolloClient({ link, cache: new InMemoryCache() });
