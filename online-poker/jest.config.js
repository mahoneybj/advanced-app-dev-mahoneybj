module.exports = {
  testEnvironment: "jsdom",
  transform: {
    "^.+\\.jsx?$": "babel-jest",
    "^.+\\.svg$": "jest-transformer-svg",
    "^.+\\.css$": "jest-transform-css",
  },
  moduleDirectories: ["node_modules", "src"],
  roots: ["<rootDir>/src"],
};
