import { HttpStatuses } from "@const/index"
import type {
    APIGatewayProxyEvent,
    APIGatewayProxyResult,
    Handler,
} from "aws-lambda"
import type { FromSchema } from "json-schema-to-ts"

type ValidatedAPIGatewayProxyEvent<S> = Omit<APIGatewayProxyEvent, "body"> & {
    body: FromSchema<S>
}
export type ValidatedEventAPIGatewayProxyEvent<S> = Handler<
    ValidatedAPIGatewayProxyEvent<S>,
    APIGatewayProxyResult
>

const CORS_HEADERS = {
    "Access-Control-Allow-Methods": "*",
    "Access-Control-Allow-Headers": "*",
    "Access-Control-Allow-Origin": "*",
}

export const formatJSONResponse = <T extends Record<string, unknown> | string>({
    payload,
    statusCode,
}: {
    payload?: T
    statusCode: HttpStatuses
}) => {
    return {
        statusCode,
        headers: {
            ...CORS_HEADERS,
        },
        body: typeof payload === "string" ? payload : JSON.stringify(payload),
    }
}
