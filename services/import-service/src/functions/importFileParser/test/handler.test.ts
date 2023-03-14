import AWS from "aws-sdk"
import { importFileParser } from "../handler"

jest.mock("aws-sdk", () => {
    const FILE_NAME = "myFile.csv"
    const FILE_PATH = __dirname + "/" + FILE_NAME
    const module = jest.requireActual("aws-sdk")
    const fs = jest.requireActual("fs")

    const getObject = jest.fn(() => {
        return {
            createReadStream: jest.fn(() => {
                return fs.createReadStream(FILE_PATH)
            }),
        }
    })
    const copyObject = jest.fn(() => {
        return {
            promise: jest.fn(() => Promise.resolve()),
        }
    })
    const deleteObject = jest.fn(() => {
        return {
            promise: jest.fn(() => Promise.resolve()),
        }
    })

    module.getMocks = () => ({
        getObject,
        copyObject,
        deleteObject,
    })

    return {
        ...module,
        S3: function S3() {
            return {
                getObject,
                copyObject,
                deleteObject,
            }
        },
    }
})

describe("λ importFileParser", () => {
    const FILE_NAME = "myFile.csv"
    const SOURCE_OBJECT_KEY = `${process.env.BUCKET_CSV_SOURCE}/${FILE_NAME}`
    const RECORD = {
        s3: {
            object: {
                key: SOURCE_OBJECT_KEY,
            },
        },
    }
    const RECORDS = [RECORD]

    afterEach(() => {
        jest.clearAllMocks()
    })

    it("should get object", async () => {
        await importFileParser({
            Records: RECORDS,
        })

        // @ts-ignore
        expect(AWS.getMocks().getObject).toHaveBeenCalledWith({
            Bucket: process.env.BUCKET_CSV,
            Key: RECORD.s3.object.key,
        })
    })

    it("should copy object", async () => {
        await importFileParser({
            Records: RECORDS,
        })

        // @ts-ignore
        expect(AWS.getMocks().copyObject).toHaveBeenCalledWith({
            Bucket: process.env.BUCKET_CSV,
            CopySource: `${process.env.BUCKET_CSV}/${RECORD.s3.object.key}`,
            Key: `${process.env.BUCKET_CSV_DIST}/${FILE_NAME}`,
        })
    })

    it("should delete object", async () => {
        await importFileParser({
            Records: RECORDS,
        })

        // @ts-ignore
        expect(AWS.getMocks().deleteObject).toHaveBeenCalledWith({
            Bucket: process.env.BUCKET_CSV,
            Key: RECORD.s3.object.key,
        })
    })
})
