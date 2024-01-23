
'use client'

import { ApolloProvider, ApolloClient, InMemoryCache } from "@apollo/client";

const client = new ApolloClient({
    uri: "https://data.rcsb.org/graphql",
    cache: new InMemoryCache()
});

export default function ApolloWrapper({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <ApolloProvider client={client}>
            {children}
        </ApolloProvider>
    )
}