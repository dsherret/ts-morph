import { tsMorph } from "./deps.ts";
const { Project } = tsMorph;

const project = new Project();
const fileSystem = project.getFileSystem();
const destPath = "../../deno";

fileSystem.mkdirSync(destPath);
fileSystem.copySync("./dist-deno/ts-morph.js", `${destPath}/ts-morph/ts_morph.js`);
fileSystem.copySync("./lib/ts-morph.d.ts", `${destPath}/ts-morph/ts_morph.d.ts`);
fileSystem.writeFileSync(`${destPath}/mod.ts`, `// @deno-types="./ts_morph.d.ts"\nexport * from "./ts_morph.js";\n`);
