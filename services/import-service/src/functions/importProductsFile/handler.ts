import { formatJSONResponse } from "@libs/api-gateway"
import { HttpStatuses } from "@const/index"
import AWS from "aws-sdk"

export const importProductsFile = async (event) => {
    try {
        const { name: fileName } = event.queryStringParameters || {}
        const s3 = new AWS.S3({ region: process.env.REGION })

        if (!fileName) {
            return formatJSONResponse({ statusCode: HttpStatuses.BadRequest })
        }

        const dist = `${process.env.BUCKET_CSV_SOURCE}/${fileName}`
        const params = {
            Bucket: process.env.BUCKET_CSV,
            Key: dist,
            Expires: 60,
            ContentType: "text/csv",
        }
        const url = await s3.getSignedUrlPromise("putObject", params)

        console.log(`λ importProductsFile url`, url)

        return formatJSONResponse({ statusCode: HttpStatuses.Ok, payload: url })
    } catch (error) {
        console.log(error)

        return formatJSONResponse({
            statusCode: HttpStatuses.InternalServerError,
        })
    }
}
