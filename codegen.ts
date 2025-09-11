// codegen.ts
import type { CodegenConfig } from "@graphql-codegen/cli";

const schemaUrl = process.env.NEXT_PUBLIC_NHOST_GRAPHQL_URL!;
const adminSecret = process.env.NHOST_ADMIN_SECRET ?? "";

const config = {
    schema: [
        {
            [schemaUrl]: {
                headers: adminSecret
                    ? { "x-hasura-admin-secret": adminSecret }
                    : {},
            },
        },
    ],
    documents: ["src/graphql/**/*.graphql"],
    generates: {
        "src/graphql/generated.ts": {
            plugins: [
                "typescript",
                "typescript-operations",
                "typescript-react-apollo",
            ],
            config: {
                withHooks: true,
                apolloClientVersion: 3,
                reactApolloVersion: 3,
                importFrom: "@apollo/client/react",
            },
        },
    },
} satisfies CodegenConfig;

export default config;
