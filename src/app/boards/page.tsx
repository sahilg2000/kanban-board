"use client";

import { Suspense } from "react";
import BoardsPage from "./BoardsPage";

export default function Page() {
    return (
        <Suspense>
            <BoardsPage />
        </Suspense>
    );
}
