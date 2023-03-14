import { Stick, StickStock, HttpStatuses, ControllerResponse } from "../types"
import { v4 as uuid4 } from "uuid"
import { logger } from "@libs/logger"
import mysql2 from "mysql2/promise"
import { createProductSchema } from "@validation/createProduct"

let mysqldbConnection: Promise<mysql2.Connection>

const getMysql = async () => await mysqldbConnection

const getControllerResponseInternalServerError =
    (): ControllerResponse<undefined> => ({
        payload: undefined,
        statusCode: HttpStatuses.INTERNAL_SERVER_ERROR,
    })

export abstract class ProductsDaoMysql {
    static init(): void {
        mysqldbConnection = mysql2.createConnection({
            host: process.env.MY_SQL_HOST,
            user: process.env.MY_SQL_MASTER_USERNAME,
            password: process.env.MY_SQL_MASTER_PASSWORD,
            port: process.env.MY_SQL_POST as unknown as number,
            database: process.env.MY_SQL_DATABASE,
        })
    }
    static async getProductsList(): Promise<ControllerResponse<Stick[]>> {
        try {
            const [rows] = await (
                await getMysql()
            )
                .query(`select id, title, description, price, Stocks.count from Products
                    left join Stocks
                    on Products.id = Stocks.product_id;`)

            return {
                payload: rows as StickStock[],
                statusCode: HttpStatuses.OK,
            }
        } catch (error) {
            return {
                payload: undefined,
                statusCode: HttpStatuses.INTERNAL_SERVER_ERROR,
            }
        }
    }

    static async getProductsById(
        id: string
    ): Promise<ControllerResponse<StickStock>> {
        try {
            const [rows] = await (
                await getMysql()
            ).query(
                `select id, title, description, price, Stocks.count from Products
                    left join Stocks
                    on Products.id = Stocks.product_id
                    where id = ?;
                    `,
                [id]
            )

            const stickStock = (rows as StickStock[])?.[0]

            if (!stickStock) {
                return {
                    payload: undefined,
                    statusCode: HttpStatuses.BAD_REQUEST,
                }
            }

            return {
                payload: stickStock,
                statusCode: HttpStatuses.OK,
            }
        } catch (error) {
            return {
                payload: undefined,
                statusCode: HttpStatuses.INTERNAL_SERVER_ERROR,
            }
        }
    }

    static async createProduct(
        stickRaw: Omit<StickStock, "id"> & Partial<Pick<Stick, "id">>
    ): Promise<ControllerResponse<Stick>> {
        try {
            const { id = uuid4(), title, description, price, count } = stickRaw
            const stickStock = {
                id,
                title,
                description,
                price,
                count,
            } as StickStock

            try {
                await createProductSchema.validate(stickStock)
            } catch {
                return {
                    payload: null,
                    statusCode: HttpStatuses.BAD_REQUEST,
                }
            }

            const mysql = await getMysql()

            await mysql.beginTransaction()

            try {
                await mysql.query(
                    `INSERT INTO Products (id, title, description, price) VALUES (?, ?, ?, ?);`,
                    [id, title, description, price]
                )
                await mysql.query(
                    `INSERT INTO Stocks (product_id, count) VALUES (?, ?);`,
                    [id, count]
                )

                mysql.commit()
            } catch (error) {
                logger.error(error)
                mysql.rollback()

                return getControllerResponseInternalServerError()
            }

            try {
                const [rows] = await mysql.query(
                    `select id, title, description, price, Stocks.count from Products
                    left join Stocks
                    on Products.id = Stocks.product_id
                    where id = ? `,
                    [id]
                )

                return {
                    payload: (rows as StickStock[])[0],
                    statusCode: HttpStatuses.CREATED,
                }
            } catch (error) {
                logger.error(error)
                mysql.rollback()
            }

            return getControllerResponseInternalServerError()
        } catch (error) {
            return getControllerResponseInternalServerError()
        }
    }
}
