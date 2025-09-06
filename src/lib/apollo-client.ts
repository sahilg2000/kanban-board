// src/lib/apollo-client.ts
import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { nhost } from "@/lib/nhost";

const httpLink = new HttpLink({
    uri: process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL as string,
});

const authLink = setContext(async (_, { headers }) => {
    const token = await nhost.auth.getAccessToken();
    return {
        headers: {
            ...headers,
            ...(token
                ? { Authorization: `Bearer ${token}` } // signed-in user
                : { "x-hasura-role": "public" }), // not signed-in → public role
        },
    };
});

export const client = new ApolloClient({
    link: authLink.concat(httpLink),
    cache: new InMemoryCache(),
});
