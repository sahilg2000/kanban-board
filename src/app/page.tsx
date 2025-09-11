"use client";
import { useState, useEffect, useRef, FormEvent } from "react";
import { useSignInEmailPassword, useAuthenticationStatus } from "@nhost/nextjs";
import { useRouter, useSearchParams } from "next/navigation";

export default function Page() {
    const r = useRouter();
    const params = useSearchParams();
    const next = params.get("next") || "/boards";

    const { isAuthenticated, isLoading: authLoading } =
        useAuthenticationStatus();
    const { signInEmailPassword, isLoading, error } = useSignInEmailPassword();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const lock = useRef(false); // hard lock against double submits

    useEffect(() => {
        if (!authLoading && isAuthenticated) r.replace(next);
    }, [authLoading, isAuthenticated, next, r]);

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        if (lock.current || isLoading) return; // block re-entry
        lock.current = true;
        try {
            await signInEmailPassword(email, password); // no redirect here
        } finally {
            lock.current = false;
        }
    }

    return (
        <main className="min-h-screen grid place-items-center p-6">
            <form
                onSubmit={onSubmit}
                className="w-full max-w-sm space-y-3"
                autoComplete="off"
            >
                <h1 className="text-xl font-semibold">Sign in</h1>
                <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                <input
                    type="password"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />
                {error && (
                    <p className="text-sm text-red-600">{error.message}</p>
                )}
                <button
                    type="submit"
                    className="w-full border rounded p-2"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing in…" : "Sign in"}
                </button>
                <p className="text-sm">
                    No account?{" "}
                    <a href="/auth/sign-up" className="underline">
                        Sign up
                    </a>
                </p>
            </form>
        </main>
    );
}
