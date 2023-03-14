import { importProductsFile } from "../handler"

describe("importProductsFile", () => {
    const FILE_NAME = "myFile.csv"

    it("should generate a signed URL", async () => {
        const response = await importProductsFile({
            queryStringParameters: { name: FILE_NAME },
        })

        expect(response.body.includes(FILE_NAME)).toBeTruthy()
        expect(response.body.includes(process.env.BUCKET_CSV)).toBeTruthy()
        expect(
            response.body.includes(process.env.BUCKET_CSV_SOURCE)
        ).toBeTruthy()
    })
})
