import { defineConfig } from "vite";
import { existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const dirname = path.dirname(fileURLToPath(import.meta.url));
let isGolok = existsSync(path.join(dirname, ".golok"));

if (isGolok && !existsSync(path.join(dirname, "_index.html"))) {
	console.warn(
		"Golok mode is enabled, but _index.html does not exist. Please check your setup."
	);
	isGolok = false;
}

export default defineConfig({
	server: {
		open: isGolok ? "/_index.html" : undefined,
	},
});
