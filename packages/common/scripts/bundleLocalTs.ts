import { folders, path, tsMorph } from "./deps.ts";
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

const typescriptLibFolderPath = path.join(folders.root, "node_modules/typescript/lib");
fileSystem.copySync(path.join(typescriptLibFolderPath, "typescript.js"), "./dist/typescript.js");
fileSystem.copySync(path.join(typescriptLibFolderPath, "typescript.d.ts"), "./lib/typescript.d.ts");

// add a _nodeWithTypeArgumentsBrand to NodeWithTypeArguments
// in order to distinguish it from TypeNode
const tsFile = project.addSourceFileAtPath("./lib/typescript.d.ts");
const nodeWithTypeArgs = tsFile
  .getModules()
  .map(m => m.getInterface("NodeWithTypeArguments"))
  .filter(m => m != null)[0]!;
nodeWithTypeArgs.insertProperty(0, {
  name: "_nodeWithTypeArgumentsBrand",
  type: "any",
});
tsFile.saveSync();
