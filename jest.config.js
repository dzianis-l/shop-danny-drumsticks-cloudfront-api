const { pathsToModuleNameMapper } = require("ts-jest")
const {
    compilerOptions: compilerOptionsProductService,
} = require("./services/product-service/tsconfig.paths.json")
const {
    compilerOptions: compilerOptionsImportService,
} = require("./services/import-service/tsconfig.paths.json")

module.exports = {
    moduleFileExtensions: ["js", "ts"],
    testPathIgnorePatterns: ["/node_modules/"],
    testTimeout: 50000,
    projects: [
        {
            displayName: "Product service",
            testEnvironment: "node",
            transform: {
                "^.+\\.[jt]s$": "babel-jest",
            },
            testMatch: ["<rootDir>/services/product-service/**/*.test.ts"],
            modulePaths: ["<rootDir>/services/product-service"],
            moduleNameMapper: pathsToModuleNameMapper(
                compilerOptionsProductService.paths
            ),
            setupFiles: ["<rootDir>/.jest/setup-env.js"],
        },
        {
            displayName: "Import service",
            testEnvironment: "node",
            transform: {
                "^.+\\.[jt]s$": "babel-jest",
            },
            testMatch: ["<rootDir>/services/import-service/**/*.test.ts"],
            modulePaths: ["<rootDir>/services/import-service"],
            moduleNameMapper: pathsToModuleNameMapper(
                compilerOptionsImportService.paths
            ),
            setupFiles: ["<rootDir>/.jest/setup-env.js"],
        },
    ],
}
