"use client";

import "./globals.css";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apollo-client";
import AuthTopRight from "@/components/auth/AuthTopRight";
import { Suspense } from "react";

// nhost
import { NhostNextProvider } from "@nhost/nextjs";
import { nhost } from "@/lib/nhost";

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <Suspense>
                    <NhostNextProvider nhost={nhost}>
                        <ApolloProvider client={client}>
                            <AuthTopRight />
                            {children}
                        </ApolloProvider>
                    </NhostNextProvider>
                </Suspense>
            </body>
        </html>
    );
}
