import { Node, Project } from "ts-morph";

const project = new Project();

const commonFile = project.addSourceFileAtPath("./dist/ts-morph-common.js");

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

project.getFileSystem().copySync("node_modules/typescript/lib/typescript.js", "./dist/typescript.js");
project.getFileSystem().copySync("node_modules/typescript/lib/typescript.d.ts", "./lib/typescript.d.ts");
