import { resolve } from "path"
import { defineConfig, loadEnv } from "vite"
import minimist from "minimist"
import { viteStaticCopy } from "vite-plugin-static-copy"
import livereload from "rollup-plugin-livereload"
import { svelte } from "@sveltejs/vite-plugin-svelte"
import zipPack from "vite-plugin-zip-pack";
import fg from 'fast-glob';

const args = minimist(process.argv.slice(2))
const isWatch = args.watch || args.w || false
const devDistDir = "./dev"
const distDir = isWatch ? devDistDir : "./dist"

console.log("isWatch=>", isWatch)
console.log("distDir=>", distDir)

const imgbedPrefix = 'https://gitlab.com/ypz.open/siyuan/siyuan-dailynote-today/-/raw/main';
/**
 * 更换图片链接
 */
function transformMdFile(content: string, filename: string, prefix: string=imgbedPrefix): string {
    //如果不是md文件，直接返回
    if (!filename.endsWith(".md")) {
        return content;
    }

    console.log("transform=>", filename);
    let imgPat = /!\[.*?\]\(\.?\/?(.*?)\)/g
    let imgurl = `${prefix}/$1`
    let newReadme = content.replace(imgPat, `![](${imgurl})`);
    // await fs.promises.writeFile(readmePath, newReadme)
    return newReadme;
}


export default defineConfig({
    resolve: {
        alias: {
            "@": resolve(__dirname, "src"),
        }
    },

    plugins: [
        svelte(),

        viteStaticCopy({
            targets: [
                {
                    src: "./README*.md",
                    dest: "./",
                    // 更换图片链接
                    transform: transformMdFile
                },
                {
                    src: "./icon.png",
                    dest: "./",
                },
                {
                    src: "./preview.png",
                    dest: "./",
                },
                {
                    src: "./plugin.json",
                    dest: "./",
                },
                {
                    src: "./src/i18n/**",
                    dest: "./i18n/",
                    transform: transformMdFile
                },
            ],
        }),
    ],

    // https://github.com/vitejs/vite/issues/1930
    // https://vitejs.dev/guide/env-and-mode.html#env-files
    // https://github.com/vitejs/vite/discussions/3058#discussioncomment-2115319
    // 在这里自定义变量
    define: {
        "process.env.DEV_MODE": `"${isWatch}"`,
    },

    build: {
        // 输出路径
        outDir: distDir,
        emptyOutDir: false,

        // 构建后是否生成 source map 文件
        sourcemap: false,

        // 设置为 false 可以禁用最小化混淆
        // 或是用来指定是应用哪种混淆器
        // boolean | 'terser' | 'esbuild'
        // 不压缩，用于调试
        minify: !isWatch,

        lib: {
            // Could also be a dictionary or array of multiple entry points
            entry: resolve(__dirname, "src/index.ts"),
            // the proper extensions will be added
            fileName: "index",
            formats: ["cjs"],
        },
        rollupOptions: {
            plugins: [
                ...(
                    isWatch ? [
                        livereload(devDistDir),
                        {
                            //监听静态资源文件
                            name: 'watch-external',
                            async buildStart() {
                                const files = await fg([
                                    'src/i18n/*.json',
                                    './README*.md',
                                    './plugin.json'
                                ]);
                                for (let file of files) {
                                    this.addWatchFile(file);
                                }
                            }
                        }
                    ] : [
                        zipPack({
                            inDir: './dist',
                            outDir: './',
                            outFileName: 'package.zip'
                        })
                    ]
                )
            ],

            // make sure to externalize deps that shouldn't be bundled
            // into your library
            external: ["siyuan", "process"],

            output: {
                entryFileNames: "[name].js",
                assetFileNames: (assetInfo) => {
                    if (assetInfo.name === "style.css") {
                        return "index.css"
                    }
                    return assetInfo.name
                },
            },
        },
    }
});
