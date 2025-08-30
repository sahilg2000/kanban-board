"use client";

import "./globals.css";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apollo-client";

// nhost
import { NhostProvider } from "@nhost/nextjs";
import { nhost } from "@/lib/nhost";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <NhostProvider nhost={nhost}>
                    <ApolloProvider client={client}>{children}</ApolloProvider>
                </NhostProvider>
            </body>
        </html>
    );
}
