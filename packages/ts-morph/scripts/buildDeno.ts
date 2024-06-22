import { tsMorph } from "./deps.ts";
const { Project } = tsMorph;

const project = new Project();
const fileSystem = project.getFileSystem();
const destPath = "../../deno/ts-morph";
const packageJson = JSON.parse(fileSystem.readFileSync("./package.json"));
const commonPackageJson = JSON.parse(fileSystem.readFileSync("../common/package.json"));

fileSystem.mkdirSync(destPath);
fileSystem.copySync("./dist-deno/ts-morph.js", `${destPath}/ts_morph.js`);
fileSystem.copySync("./lib/ts-morph.d.ts", `${destPath}/ts_morph.d.ts`);
fileSystem.writeFileSync(`${destPath}/mod.ts`, `// @deno-types="./ts_morph.d.ts"\nexport * from "./ts_morph.js";\n`);
fileSystem.writeFileSync(
  `${destPath}/deno.json`,
  JSON.stringify(
    {
      "name": "@ts-morph/ts-morph",
      "version": packageJson.version,
      "exports": "./mod.ts",
      "imports": {
        "@ts-morph/common": `jsr:@ts-morph/common@^${commonPackageJson.version}`,
        "code-block-writer": "jsr:@david/code-block-writer@^13",
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
  `${destPath}/readme.md`,
  `
# ts-morph

To use:

\`\`\`
deno add ts-morph@jsr:@ts-morph/ts-morph
\`\`\`

\`\`\`ts
import { Project } from "ts-morph";
\`\`\`

Or use \`@ts-morph/bootstrap\`:

\`\`\`
deno add @ts-morph/bootstrap
\`\`\`

\`\`\`ts
import { createProject } from "@ts-morph/bootstrap";
\`\`\`

Please note that this is currently only mostly useful for analyzing Node projects. See [#950](https://github.com/dsherret/ts-morph/issues/950) for details on making it easier to analyze Deno code.

Note: These modules are not tested that well as I have not implemented a way to test both the node and deno modules. Please let me know if you notice any behaviour differences with the node module.
`.trimStart(),
);

fileSystem.writeFileSync(
  `${destPath}/basic_test.ts`,
  `
import { assertEquals } from "jsr:@std/assert@0.225.3";
import { Project } from "./mod.ts";

// todo: Eventually all tests run for the node package should also be run for Deno
Deno.test("ts-morph basic tests", () => {
  const project = new Project({ useInMemoryFileSystem: true });
  const sourceFile = project.createSourceFile("test.ts", "class T {\\n}");
  sourceFile.addClass({
    name: "Other",
  });
  assertEquals(sourceFile.getText(), "class T {\\n}\\n\\nclass Other {\\n}\\n");
});
`.trimStart(),
);
