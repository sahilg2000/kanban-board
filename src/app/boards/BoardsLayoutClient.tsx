import RequireAuth from "@/components/auth/RequireAuth";
import BoardsSidebar from "@/components/boards/BoardsSidebar";
import { usePathname } from "next/navigation";

export default function BoardsLayoutClient({
    children,
}: {
    children: React.ReactNode;
}) {
    const path = usePathname(); // changes when /boards/[id] changes
    return (
        <RequireAuth>
            <div className="grid grid-cols-[280px_1fr] h-dvh">
                <aside className="border-r overflow-y-auto min-w-0">
                    <BoardsSidebar />
                </aside>
                <section key={path} className="min-w-0 overflow-y-auto">
                    {children}
                </section>
            </div>
        </RequireAuth>
    );
}
