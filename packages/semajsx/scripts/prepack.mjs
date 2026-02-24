// Swap exports from source (.ts) paths to dist (.mjs) paths before packing.
// The postpack script restores package.json via `git checkout`.
import { readFileSync, writeFileSync } from "fs";

const pkg = JSON.parse(readFileSync("package.json", "utf8"));
const exports = pkg.exports;

if (exports) {
	const swapped = {};
	for (const [key, value] of Object.entries(exports)) {
		if (key === "./package.json") {
			swapped[key] = value;
		} else {
			swapped[key] = value.replace(/^\.\/src\//, "./dist/").replace(/\.ts$/, ".mjs");
		}
	}
	pkg.exports = swapped;
	writeFileSync("package.json", JSON.stringify(pkg, null, 2) + "\n");
}
