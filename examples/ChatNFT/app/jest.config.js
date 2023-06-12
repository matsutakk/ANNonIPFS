module.exports = {
    preset: "ts-jest/presets/js-with-babel-esm",
    testMatch: [
      "**/__tests__/**/*.+(ts|tsx|js)",
      "**/?(*.)+(spec|test).+(ts|tsx|js)"
    ],
    moduleNameMapper: {
        "^@/(.*)$": "<rootDir>/$1",
    },
    // transform: {
    //     "<rootDir>/node_modules/*": "ts-jest",
    // },
    transform: {
        '^.+\\.ts?$': 'ts-jest',
      },
      transformIgnorePatterns: ['<rootDir>/node_modules/'],
    // transformIgnorePatterns: ['<rootDir>/node_modules/(?!web3.storage)'],
    testEnvironment: 'jest-environment-jsdom'
}