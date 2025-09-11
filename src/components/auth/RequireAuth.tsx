"use client";
import { useEffect } from "react";
import { useAuthenticationStatus } from "@nhost/nextjs";
import { usePathname, useSearchParams, useRouter } from "next/navigation";

export default function RequireAuth({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isAuthenticated, isLoading } = useAuthenticationStatus();
    const r = useRouter();
    const pathname = usePathname();
    const search = useSearchParams();

    useEffect(() => {
        if (isLoading) return;
        if (!isAuthenticated) {
            const qs = search.toString();
            const next = qs ? `${pathname}?${qs}` : pathname;
            r.replace(`/?next=${encodeURIComponent(next)}`);
        }
    }, [isAuthenticated, isLoading, pathname, search, r]);

    if (isLoading) return null;
    if (!isAuthenticated) return null;
    return <>{children}</>;
}
