import { handlerPath } from "@libs/handler-resolver"

export default {
    handler: `${handlerPath(__dirname)}/handler.importProductsFile`,
    events: [
        {
            http: {
                method: "get",
                path: "import",
                cors: true,
                request: {
                    parameters: {
                        querystrings: {
                            name: true,
                        },
                    },
                },
            },
        },
    ],
}
