// Mechanically strips TypeScript syntax from .ts/.tsx files while preserving
// JSX exactly as written, using the TypeScript compiler's transpile API.
const ts = require("typescript");
const fs = require("fs");
const path = require("path");

const SRC_ROOT = process.argv[2]; // e.g. .../frontend/src
const OUT_ROOT = process.argv[3]; // e.g. .../frontend-react/src
const FILES = process.argv.slice(4); // relative paths (posix) from SRC_ROOT

for (const rel of FILES) {
  const srcPath = path.join(SRC_ROOT, rel);
  const source = fs.readFileSync(srcPath, "utf8");

  const result = ts.transpileModule(source, {
    compilerOptions: {
      jsx: ts.JsxEmit.Preserve,
      target: ts.ScriptTarget.ES2022,
      module: ts.ModuleKind.ESNext,
      removeComments: false,
      esModuleInterop: true,
    },
    fileName: srcPath,
  });

  let out = result.outputText;
  out = out.replace(/[ \t]+\n/g, "\n");

  const outRel = rel.replace(/\.tsx$/, ".jsx").replace(/\.ts$/, ".js");
  const outPath = path.join(OUT_ROOT, outRel);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, out);
  console.log(`${rel} -> ${outRel}`);
}
