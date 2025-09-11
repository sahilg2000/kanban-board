// src/components/auth/AuthTopRight.tsx
"use client";

import { useAuthenticationStatus, useUserData } from "@nhost/nextjs";
import { SignOutButton } from "@/components/auth/SignOutButton";

export default function AuthTopRight() {
    const { isAuthenticated, isLoading } = useAuthenticationStatus();
    const user = useUserData();

    if (isLoading || !isAuthenticated) return null;

    return (
        <div className="fixed top-0 right-0 z-50 p-3">
            <div className="flex items-center gap-3 rounded-lg border bg-white/90 px-3 py-1 shadow">
                <span className="text-sm max-w-[180px] truncate">
                    {user?.displayName || user?.email}
                </span>
                <SignOutButton className="text-sm border rounded px-3 py-1" />
            </div>
        </div>
    );
}
