const path = require("path");
const fs = require("fs");
const webpack = require("webpack");
const {EsbuildPlugin} = require("esbuild-loader");
const MiniCssExtractPlugin = require("mini-css-extract-plugin");
const CopyPlugin = require("copy-webpack-plugin");
const ZipPlugin = require("zip-webpack-plugin");
const sveltePreprocess = require("svelte-preprocess");
const ReplaceInFileWebpackPlugin = require('replace-in-file-webpack-plugin');

module.exports = (env, argv) => {
    const isPro = argv.mode === "production";
    const plugins = [
        new MiniCssExtractPlugin({
            filename: isPro ? "dist/index.css" : "index.css",
        })
    ];
    let entry = {
        "index": "./src/index.ts",
    };
    if (isPro) {
        entry = {
            "dist/index": "./src/index.ts",
        };
        // plugins.push(new webpack.BannerPlugin({
        //     banner: () => {
        //         return fs.readFileSync("LICENSE").toString();
        //     },
        // }));
        plugins.push(new CopyPlugin({
            patterns: [
                {from: "preview.png", to: "./dist/"},
                {from: "icon.png", to: "./dist/"},
                {from: "README*.md", to: "./dist/"},
                {from: "plugin.json", to: "./dist/"},
                {from: "src/i18n/", to: "./dist/i18n/"},
            ],
        }));
        //把图片地址全部替换成国内的托管
        // plugins.push(new ReplaceInFileWebpackPlugin([
        //     {
        //         dir: 'dist',
        //         files: ['README.md'],
        //         rules: [{
        //             search: /\.?\/?asset/g,
        //             replace: 'https://gitcode.net/frostime/siyuan-plugin-daily-note/-/raw/main/asset'
        //         }]
        //     }
        // ]));
        plugins.push(new ZipPlugin({
            filename: "package.zip",
            algorithm: "gzip",
            include: [/dist/],
            pathMapper: (assetPath) => {
                return assetPath.replace("dist/", "");
            },
        }));
    } else {
        plugins.push(new CopyPlugin({
            patterns: [
                {from: "src/i18n/", to: "./i18n/"},
            ],
        }));
    }
    return {
        mode: argv.mode || "development",
        watch: !isPro,
        devtool: isPro ? false : "eval",
        output: {
            filename: "[name].js",
            path: path.resolve(__dirname),
            libraryTarget: "commonjs2",
            library: {
                type: "commonjs2",
            },
        },
        externals: {
            siyuan: "siyuan",
        },
        entry,
        optimization: {
            minimize: true,
            minimizer: [
                new EsbuildPlugin(),
            ],
        },
        resolve: {
            alias: {
                svelte: path.resolve('node_modules', 'svelte')
            },
            extensions: [".ts", ".scss", ".svelte"],
            mainFields: ['svelte', 'browser', 'module', 'main'],
            conditionNames: ['svelte']
        },
        module: {
            rules: [
                {
                    test: /\.ts(x?)$/,
                    include: [path.resolve(__dirname, "src")],
                    use: [
                        {
                            loader: "esbuild-loader",
                            options: {
                                target: "es6",
                            }
                        },
                    ],
                },
                {
                    test: /\.svelte$/,
                    // include: [path.resolve(__dirname, "src")],
                    use: [
                        {
                            loader: 'svelte-loader',
                            options: {
                                preprocess: sveltePreprocess({
                                    alias: [['ts', 'typescript']],
                                    typescript: {
                                        tsconfigFile: "./tsconfig.json",
                                    }
                                })
                            }
                        }
                    ]
                },
                {
                    // required to prevent errors from Svelte on Webpack 5+, omit on Webpack 4
                    test: /node_modules\/svelte\/.*\.mjs$/,
                    resolve: {
                        fullySpecified: false
                    }
                },
                {
                    test: /\.scss$/,
                    include: [path.resolve(__dirname, "src")],
                    use: [
                        MiniCssExtractPlugin.loader,
                        {
                            loader: "css-loader", // translates CSS into CommonJS
                        },
                        {
                            loader: "sass-loader", // compiles Sass to CSS
                        },
                    ],
                }
            ],
        },
        plugins,
    };
};