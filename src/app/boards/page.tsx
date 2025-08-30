"use client";
import { nhost } from "@/lib/nhost";
import { useState, useEffect } from "react";

export default function BoardsPage() {
    const [data, setData] = useState<{ id: string; name: string }[] | null>(
        null
    );
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        (async () => {
            const query =
                "query { boards(order_by: {created_at: asc}) { id name }} ";
            const { data, error } = await nhost.graphql.request(query);
            if (error) {
                const msg = Array.isArray(error)
                    ? error.map((e) => e.message).join(";")
                    : error.message;
                setErr(msg);
            } else {
                setData(data?.boards ?? []);
            }
        })();
    }, []);

    if (err) return <p>Error: {err}</p>;
    if (!data) return <p>Loading...</p>;
    return (
        <ul>
            {data.map((b) => (
                <li key={b.id}>{b.name}</li>
            ))}
        </ul>
    );
}
