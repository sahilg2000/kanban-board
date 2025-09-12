import "./globals.css";
import { ApolloProvider } from "@apollo/client/react";
import { client } from "@/lib/apollo-client";
import AuthTopRight from "@/components/auth/AuthTopRight";

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
                <NhostNextProvider nhost={nhost}>
                    <ApolloProvider client={client}>
                        <AuthTopRight />
                        {children}
                    </ApolloProvider>
                </NhostNextProvider>
            </body>
        </html>
    );
}
