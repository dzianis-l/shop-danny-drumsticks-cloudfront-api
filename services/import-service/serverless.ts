import type { AWS } from "@serverless/typescript"

import { join } from "path"
import { config } from "dotenv"

const pathToEnv = join(__dirname, "./.env")
config({ path: pathToEnv })

import importProductsFile from "@functions/importProductsFile"
import importFileParser from "@functions/importFileParser"

const serverlessConfiguration: AWS = {
    service: "import-service",
    frameworkVersion: "3",
    plugins: ["serverless-esbuild"],
    provider: {
        name: "aws",
        profile: "danny",
        stage: "dev",
        region: process.env.REGION as AWS["provider"]["region"],
        runtime: "nodejs14.x",
        apiGateway: {
            minimumCompressionSize: 1024,
            shouldStartNameWithService: true,
        },
        environment: {
            AWS_NODEJS_CONNECTION_REUSE_ENABLED: "1",
            NODE_OPTIONS: "--enable-source-maps --stack-trace-limit=1000",
            REGION: process.env.REGION,
            BUCKET_CSV: process.env.BUCKET_CSV,
            BUCKET_CSV_SOURCE: process.env.BUCKET_CSV_SOURCE,
            BUCKET_CSV_DIST: process.env.BUCKET_CSV_DIST,
        },
        iamRoleStatements: [
            {
                Effect: "Allow",
                Action: "s3:ListBucket",
                Resource: ["arn:aws:s3:::shop-danny-csv-bucket"],
            },
            {
                Effect: "Allow",
                Action: ["s3:*"],
                Resource: ["arn:aws:s3:::shop-danny-csv-bucket/*"],
            },
        ],
    },

    // import the function via paths
    functions: { importProductsFile, importFileParser },
    package: { individually: true },
    custom: {
        esbuild: {
            bundle: true,
            minify: false,
            sourcemap: true,
            exclude: ["aws-sdk"],
            target: "node14",
            define: { "require.resolve": undefined },
            platform: "node",
            concurrency: 10,
        },
    },
}

module.exports = serverlessConfiguration
