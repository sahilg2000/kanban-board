import type { CodegenConfig } from "@graphql-codegen/cli";
import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.local" });

const config: CodegenConfig = {
    schema: {
        [process.env.NHOST_GRAPHQL_URL as string]: {
            headers: {
                "x-hasura-admin-secret": process.env
                    .NHOST_ADMIN_SECRET as string,
            },
        },
    },
    documents: "src/graphql/**/*.graphql",
    generates: {
        "src/graphql/generated.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typed-document-node",
            ],
            config: {
                addDocBlocks: false,
            },
        },
    },
};

export default config;
