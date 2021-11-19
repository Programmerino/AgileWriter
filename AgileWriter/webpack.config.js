// Note this only includes basic configuration for development mode.
// For a more comprehensive configuration check:
// https://github.com/fable-compiler/webpack-config-template

var path = require("path");

module.exports = {
    mode: "development",
    entry: "./src/App.fs.js",
    output: {
        path: path.join(__dirname, "./src/resources/js"),
        filename: "bundle.js",
        libraryTarget: 'var',
        library: 'fscode'
    },
    devServer: {
        publicPath: "/",
        contentBase: "./public",
        port: 8083,
    },
    module: {
    }
}
