"use client";
import type { Card } from "@/hooks/useCards";

export default function CardItem({ card }: { card: Card }) {
    return (
        <li className="border rounded p-2 shadow-sm">
            <div className="font-medium">{card.name}</div>
        </li>
    );
}
