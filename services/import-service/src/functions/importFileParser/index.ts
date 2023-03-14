import { handlerPath } from "@libs/handler-resolver"

export default {
    handler: `${handlerPath(__dirname)}/handler.importFileParser`,
    events: [
        {
            s3: {
                bucket: process.env.BUCKET_CSV,
                event: "s3:ObjectCreated:*",
                existing: true,
                rules: [{ prefix: `${process.env.BUCKET_CSV_SOURCE}/` }],
            },
        },
    ],
}
