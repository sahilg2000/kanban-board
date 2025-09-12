import RequireAuth from "@/components/auth/RequireAuth";
import BoardsLayoutClient from "./BoardsLayoutClient";

export default function BoardsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <RequireAuth>
            <BoardsLayoutClient>{children}</BoardsLayoutClient>
        </RequireAuth>
    );
}
