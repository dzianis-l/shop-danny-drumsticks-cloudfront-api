const dotenv = require("dotenv")
const path = require("path")
const pathToEnvProductService = path.join(
    __dirname,
    "../services/product-service/.env"
)
const pathToEnvImportService = path.join(
    __dirname,
    "../services/import-service/.env"
)

dotenv.config({ path: pathToEnvProductService })
dotenv.config({ path: pathToEnvImportService })
