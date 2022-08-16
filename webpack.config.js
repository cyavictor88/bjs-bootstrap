const path = require("path");
const fs = require("fs");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const appDirectory = fs.realpathSync(process.cwd());
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
module.exports = {
    devtool: 'inline-source-map',  // vic to surpress firefox thousands of warning about "Source Maps not working with Webpack" https://stackoverflow.com/questions/37928165/source-maps-not-working-with-webpack
    entry: path.resolve(appDirectory, "src/mathtext/app.ts"), //path to the main .ts file
    output: {
        filename: "js/mathtext.js", //name for the js file that is created/compiled in memory
        clean: true,
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
        // fallback: {
            // "fs": false
        // },
    },
    devServer: {
        host: "0.0.0.0",
        port: 8080, //port that we're using for local host (localhost:8080)
        static: path.resolve(appDirectory, "public"), //tells webpack to serve from the public folder
        hot: true,
        devMiddleware: {
            publicPath: "/",
        }
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: "ts-loader",
                exclude: /node_modules/,
            },
        ],
    },
    plugins: [
        new HtmlWebpackPlugin({
            inject: true,
            template: path.resolve(appDirectory, "public/index.html"),
        }) , 
        // new NodePolyfillPlugin()
    ],

    mode: "development",
};

// to get jison to work, npm install --save-dev node-polyfill-webpack-plugin
// and then add those lines:
// const NodePolyfillPlugin = require('node-polyfill-webpack-plugin')
// 
// plugins: [
//     ... ,
//     new NodePolyfillPlugin(),
//     ...,
// ],
// resolve: {
//     ...,
//     fallback: {
//         "fs": false
//     },
//      ...,
// },