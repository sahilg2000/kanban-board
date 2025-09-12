"use client";

import { useState, FormEvent, Suspense } from "react";
import { useSignUpEmailPassword } from "@nhost/nextjs";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function Page() {
    return (
        <Suspense>
            <SignUpPage />
        </Suspense>
    );
}

function SignUpPage() {
    const { signUpEmailPassword, isLoading, error, needsEmailVerification } =
        useSignUpEmailPassword();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const r = useRouter();
    const params = useSearchParams();

    async function onSubmit(e: FormEvent) {
        e.preventDefault();
        const { isError } = await signUpEmailPassword(email, password);
        if (!isError) {
            const next = params.get("next") || "/boards";
            r.replace(next);
        }
    }

    return (
        <main className="min-h-screen grid place-items-center p-6">
            <form onSubmit={onSubmit} className="w-full max-w-sm space-y-3">
                <h1 className="text-xl font-semibold">Sign up</h1>

                <input
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />

                <input
                    type="password"
                    autoComplete="new-password"
                    placeholder="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full border rounded p-2"
                    required
                />

                {error && (
                    <p className="text-sm text-red-600">{error.message}</p>
                )}
                {needsEmailVerification && (
                    <p className="text-sm">
                        Check your email to verify your account.
                    </p>
                )}

                <button
                    type="submit"
                    className="w-full border rounded p-2"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating…" : "Create account"}
                </button>

                <p className="text-sm">
                    Have an account?{" "}
                    <Link href="/" className="underline">
                        Sign in
                    </Link>
                </p>
            </form>
        </main>
    );
}
