import { tsMorph } from "./deps.ts";
const { Project } = tsMorph;

const project = new Project();
const fileSystem = project.getFileSystem();
const destPath = "../../deno/bootstrap";
const packageJson = JSON.parse(fileSystem.readFileSync("./package.json"));
const commonPackageJson = JSON.parse(fileSystem.readFileSync("../common/package.json"));

fileSystem.mkdirSync(destPath);
fileSystem.copySync("./dist-deno/ts-morph-bootstrap.js", `${destPath}/ts_morph_bootstrap.js`);
fileSystem.copySync("./lib/ts-morph-bootstrap.d.ts", `${destPath}/ts_morph_bootstrap.d.ts`);
fileSystem.writeFileSync(`${destPath}/mod.ts`, `// @deno-types="./ts_morph_bootstrap.d.ts"\nexport * from "./ts_morph_bootstrap.js";\n`);
fileSystem.writeFileSync(
  `${destPath}/deno.json`,
  JSON.stringify(
    {
      "name": "@ts-morph/bootstrap",
      "version": packageJson.version,
      "exports": "./mod.ts",
      "imports": {
        "@ts-morph/common": `jsr:@ts-morph/common@^${commonPackageJson.version}`,
      },
    },
    null,
    2,
  ) + "\n",
);
fileSystem.writeFileSync(
  `${destPath}/../deno.json`,
  JSON.stringify(
    {
      "workspaces": [
        "./bootstrap",
        "./common",
        "./ts-morph",
      ],
    },
    null,
    2,
  ) + "\n",
);

fileSystem.writeFileSync(
  `${destPath}/basic_test.ts`,
  `
import { assertEquals } from "jsr:@std/assert@0.225.3";
import { createProjectSync } from "./mod.ts";

// todo: Eventually all tests run for the node package should also be run for Deno
Deno.test("bootstrap general tests", () => {
  const project = createProjectSync({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("test.ts", "class T {\\n}\\n");
  assertEquals(sourceFile.statements[0].getText(), "class T {\\n}");
});
`.trimStart(),
);
