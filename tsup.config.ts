import { defineConfig } from "tsup";

export default defineConfig((options) => {
    options.bundle = true;
    options.entry = ["src/_wasm.ts", "src/index.ts"];
    if (options.format?.includes("cjs")) {
        options.noExternal = ["human-id"];
    }
    options.metafile = true;
    options.sourcemap = true;

    return options;
});
