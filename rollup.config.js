import resolve from "@rollup/plugin-node-resolve";
import typescript from "@rollup/plugin-typescript";
import react from "@vitejs/plugin-react"; // ✅ Handles jsx-runtime

export default {
  input: {
    index: "src/index.ts",
    useRocketLeagueSocket: "src/useRocketLeagueSocket.ts",
    RLProvider: "src/RLProvider.tsx",
  },
  output: {
    dir: "dist",
    format: "esm",
    sourcemap: true,
    preserveModules: true,
    preserveModulesRoot: "src",
  },
  external: ["react", "react/jsx-runtime"],
  plugins: [
    resolve(),
    react(), // ✅ handles JSX + react/jsx-runtime correctly
    typescript({
      tsconfig: "./tsconfig.json",
      declaration: true,
      declarationDir: "dist",
    }),
  ],
};
