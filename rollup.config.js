import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import { terser } from "rollup-plugin-terser";

export default {
  input: "src/useRocketLeagueSocket.ts",
  output: {
    file: "dist/index.js",
    format: "esm",
    sourcemap: true,
    plugins: [terser()],
  },
  external: ["react"],
  plugins: [
    resolve(),
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: false, // we already emit declarations via tsc
      outDir: "dist",
    }),
  ],
};
