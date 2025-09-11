"use client";

import { useState } from "react";
import { useSignOut } from "@nhost/nextjs";
import { useRouter } from "next/navigation";

export function SignOutButton({ className }: { className?: string }) {
    const { signOut } = useSignOut();
    const [pending, setPending] = useState(false);
    const r = useRouter();

    async function onClick() {
        if (pending) return;
        setPending(true);
        try {
            await signOut(); // or: await signOut({ all: true })
            r.replace("/");
        } finally {
            setPending(false);
        }
    }

    return (
        <button onClick={onClick} disabled={pending} className={className}>
            {pending ? "Signing out…" : "Sign out"}
        </button>
    );
}
