"use client";

import { Suspense } from "react";
import BoardByIdPage from "./BoardByIdPage";

export default function Page() {
    return (
        <Suspense>
            <BoardByIdPage />
        </Suspense>
    );
}
