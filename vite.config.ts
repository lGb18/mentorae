import { rmSync } from "node:fs"
import path from "path"
import { defineConfig, loadEnv } from "vite"
import react from "@vitejs/plugin-react"
import electron from "vite-plugin-electron/simple"
import pkg from "./package.json"

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => { 
  rmSync("dist-electron", { recursive: true, force: true })

  const env = loadEnv(mode, process.cwd(), "") 
  const isServe = command === "serve"
  const isBuild = command === "build"
  const sourcemap = isServe || !!process.env.VSCODE_DEBUG
  const externalDeps = Object.keys(pkg.dependencies || {})

  return {
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_ANON_KEY": JSON.stringify(env.VITE_SUPABASE_ANON_KEY),
    },
    plugins: [
      react(),
      electron({
        main: {
          entry: "electron/main/index.ts",
          onstart(args) {
            if (process.env.VSCODE_DEBUG) {
              console.log("[startup] Electron App")
            } else {
              args.startup()
            }
          },
          vite: {
            build: {
              sourcemap,
              minify: isBuild,
              outDir: "dist-electron/main",
              rollupOptions: {
                external: externalDeps,
              },
            },
          },
        },
        preload: {
          input: "electron/preload/index.ts",
          vite: {
            build: {
              sourcemap: sourcemap ? "inline" : undefined,
              minify: isBuild,
              outDir: "dist-electron/preload",
              rollupOptions: {
                external: externalDeps,
              },
            },
          },
        },
        renderer: {},
      }),
    ],
    server:
      process.env.VSCODE_DEBUG &&
      (() => {
        const url = new URL(pkg.debug.env.VITE_DEV_SERVER_URL)
        return {
          host: url.hostname,
          port: +url.port,
        }
      })(),
    clearScreen: false,
  }
})

