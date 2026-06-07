import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  clean: true,
  dts: false,
  shims: true,
  noExternal: [/@start-x-work\/.*/],
});
