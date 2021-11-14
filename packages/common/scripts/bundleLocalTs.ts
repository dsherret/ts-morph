import { tsMorph } from "./deps.ts";
const { Node, Project } = tsMorph;

const project = new Project();
const folderPath = "./dist";
const fileSystem = project.getFileSystem();

const commonFile = project.addSourceFileAtPath(`${folderPath}/ts-morph-common.js`);

for (const varDecl of commonFile.getVariableDeclarations()) {
  const initializer = varDecl.getInitializer();
  if (initializer != null && Node.isCallExpression(initializer) && initializer.getExpression().getText() === "require") {
    const args = initializer.getArguments();
    const firstArg = args?.[0];
    if (args.length === 1 && firstArg != null && Node.isStringLiteral(firstArg) && firstArg.getLiteralValue() === "typescript")
      varDecl.setInitializer("require('./typescript')");
  }
}

commonFile.saveSync();

fileSystem.copySync("node_modules/typescript/lib/typescript.js", "./dist/typescript.js");
fileSystem.copySync("node_modules/typescript/lib/typescript.d.ts", "./lib/typescript.d.ts");
