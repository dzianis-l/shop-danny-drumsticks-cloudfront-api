import {
    Stick,
    Stock,
    StickStock,
    HttpStatuses,
    ControllerResponse,
} from "../types"
import AWS from "aws-sdk"
import { v4 as uuid4 } from "uuid"

const dynamo = new AWS.DynamoDB.DocumentClient({ region: process.env.REGION })

export abstract class ProductsController {
    static async getProductsList(): Promise<ControllerResponse<Stick[]>> {
        const productsResults = await dynamo
            .scan({
                TableName: process.env.TABLE_PRODUCTS,
            })
            .promise()

        const stocksResults = await dynamo
            .scan({
                TableName: process.env.TABLE_STOCKS,
            })
            .promise()

        const sticks = productsResults.Items as Stick[]
        const stocks = stocksResults.Items as Stock[]

        // left join
        const sticksStocks: StickStock[] = sticks.map((stick) => ({
            ...stick,
            count: (
                stocks.find((stock) => stock.product_id === stick.id) as Stock
            ).count,
        }))

        return { payload: sticksStocks, statusCode: HttpStatuses.OK }
    }

    static async getProductsById(
        id: string
    ): Promise<ControllerResponse<Stick>> {
        const results = await dynamo
            .query({
                TableName: process.env.TABLE_PRODUCTS,
                KeyConditionExpression: "id = :id",
                ExpressionAttributeValues: { ":id": id },
            })
            .promise()

        const stick = results.Items?.[0] as Stick

        return {
            payload: stick ? stick : undefined,
            statusCode: stick ? HttpStatuses.OK : HttpStatuses.NOT_FOUND,
        }
    }

    static async createProduct(
        stickRaw: Omit<StickStock, StickStock["id"]>
    ): Promise<ControllerResponse<Stick>> {
        const stickStock = { id: uuid4(), ...stickRaw } as StickStock
        const { count, ...stick } = stickStock
        const stock = { count, product_id: stick.id }

        await dynamo
            .put({
                TableName: process.env.TABLE_PRODUCTS,
                Item: stick,
            })
            .promise()

        await dynamo
            .put({
                TableName: process.env.TABLE_STOCKS,
                Item: stock,
            })
            .promise()

        return {
            payload: stick,
            statusCode: HttpStatuses.OK,
        }
    }
}
