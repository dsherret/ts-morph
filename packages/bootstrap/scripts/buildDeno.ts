import { tsMorph } from "./deps.ts";
const { Project } = tsMorph;

const project = new Project();
const fileSystem = project.getFileSystem();
const destPath = "../../deno/bootstrap";

fileSystem.mkdirSync(destPath);
fileSystem.copySync("./dist-deno/ts-morph-bootstrap.js", `${destPath}/ts_morph_bootstrap.js`);
fileSystem.copySync("./lib/ts-morph-bootstrap.d.ts", `${destPath}/ts_morph_bootstrap.d.ts`);
fileSystem.writeFileSync(`${destPath}/mod.ts`, `// @deno-types="./ts_morph_bootstrap.d.ts"\nexport * from "./ts_morph_bootstrap.js";\n`);
