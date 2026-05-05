module.exports = {
    testEnvironment: "node",
    roots: ["<rootDir>/tests"],
    setupFiles: ["<rootDir>/tests/env.ts"],
    setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
    testTimeout: 30000,
    transform: {
        "^.+\\.ts$": ["ts-jest", {
            tsconfig: "tsconfig.spec.json"
        }]
    }
}
