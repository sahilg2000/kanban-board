"use client";
import { useState, useRef, useEffect } from "react";
import { MoreVertical } from "lucide-react";

export default function DropdownMenu({
    onEdit,
    onDelete,
}: {
    onEdit?: () => void;
    onDelete?: () => void;
}) {
    const [open, setOpen] = useState(false);
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function onDocClick(e: MouseEvent) {
            if (!ref.current) return;
            if (!ref.current.contains(e.target as Node)) setOpen(false);
        }
        document.addEventListener("click", onDocClick);
        return () => document.removeEventListener("click", onDocClick);
    }, []);

    return (
        <div ref={ref} className="relative">
            <button
                type="button"
                onClick={() => setOpen((v) => !v)}
                className="p-1 rounded hover:bg-gray-100"
                aria-haspopup="menu"
                aria-expanded={open}
            >
                <MoreVertical className="h-4 w-4 text-gray-500" />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 z-10 mt-1 w-36 rounded-md border bg-white shadow-sm"
                >
                    <button
                        role="menuitem"
                        onClick={onEdit}
                        className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50"
                    >
                        Edit
                    </button>
                    <div className="my-1 h-px bg-gray-100" />
                    <button
                        role="menuitem"
                        onClick={onDelete}
                        className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                    >
                        Delete
                    </button>
                </div>
            )}
        </div>
    );
}
